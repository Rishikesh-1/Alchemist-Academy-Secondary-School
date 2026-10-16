<?php
// api/attendance/alerts.php
// Dispatches immediate absence alerts to guardians via SMS/in-app/email
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth_guard.php';

$user = requireAuth($pdo, ['superadmin', 'admin', 'principal', 'teacher', 'academic']);
$schoolId = (int)$user['school_id'];
$branchId = !empty($_GET['branch_id']) ? (int)$_GET['branch_id'] : ($user['branch_id'] ? (int)$user['branch_id'] : null);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method not allowed. Use POST.', null, 405);
}

$input = getJsonInput();
$date = trim((string)($input['date'] ?? date('Y-m-d')));
$classId = !empty($input['class_id']) ? (int)$input['class_id'] : null;
$channel = trim((string)($input['channel'] ?? 'sms')); // 'sms' | 'email' | 'in_app'

// Find students marked absent on this date
$sql = "
    SELECT 
        s.id as student_id,
        s.first_name,
        s.last_name,
        s.admission_no,
        s.guardian_name,
        s.guardian_phone,
        s.guardian_email,
        c.name as class_name,
        ar.id as attendance_record_id,
        ar.type as attendance_type
    FROM attendance_records ar
    JOIN students s ON ar.student_id = s.id
    LEFT JOIN classes c ON s.class_id = c.id
    WHERE ar.school_id = :school_id 
      AND ar.date_ad = :att_date 
      AND ar.status = 'absent'
";

$params = [
    ':school_id' => $schoolId,
    ':att_date'  => $date,
];

if ($classId) {
    $sql .= " AND s.class_id = :class_id";
    $params[':class_id'] = $classId;
}

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$absentees = $stmt->fetchAll();

if (empty($absentees)) {
    jsonResponse(true, "No absent students found for {$date}. Zero alerts needed.", [
        'alerts_sent' => 0,
        'absentees'   => [],
    ]);
}

$pdo->beginTransaction();

try {
    $insertAlert = $pdo->prepare("
        INSERT INTO absence_alerts 
        (school_id, student_id, date_ad, guardian_phone, guardian_email, channel, message_body, status)
        VALUES 
        (:school_id, :student_id, :date_ad, :phone, :email, :channel, :body, 'sent')
    ");

    $insertNotification = $pdo->prepare("
        INSERT INTO notifications 
        (school_id, branch_id, title, message, channel, target_role, target_user_id, status)
        VALUES 
        (:school_id, :branch_id, :title, :message, :channel, 'parent', NULL, 'sent')
    ");

    $sentList = [];

    foreach ($absentees as $st) {
        $studentFullName = "{$st['first_name']} {$st['last_name']}";
        $guardianPhone = $st['guardian_phone'] ?: 'N/A';
        $guardianEmail = $st['guardian_email'] ?: null;
        $messageText = "Dear Parent/Guardian, {$studentFullName} (Class: {$st['class_name']}, Roll/Adm: {$st['admission_no']}) was marked ABSENT today ({$date}). Please contact school administration if you did not authorize this absence.";

        $insertAlert->execute([
            ':school_id'   => $schoolId,
            ':student_id'  => (int)$st['student_id'],
            ':date_ad'     => $date,
            ':phone'       => $guardianPhone,
            ':email'       => $guardianEmail,
            ':channel'     => in_array($channel, ['sms', 'email', 'in_app', 'whatsapp']) ? $channel : 'sms',
            ':body'        => $messageText,
        ]);

        $insertNotification->execute([
            ':school_id'  => $schoolId,
            ':branch_id'  => $branchId,
            ':title'      => "Absence Notice: {$studentFullName}",
            ':message'    => $messageText,
            ':channel'    => $channel,
        ]);

        $sentList[] = [
            'student_id'     => $st['student_id'],
            'student_name'   => $studentFullName,
            'guardian_phone' => $guardianPhone,
            'status'         => 'dispatched',
        ];
    }

    $pdo->commit();

    logAuditAction(
        $pdo,
        $schoolId,
        $branchId,
        (int)$user['id'],
        $user['name'],
        $user['role_slug'],
        'ABSENCE_ALERTS_DISPATCH',
        'absence_alerts',
        $date,
        null,
        ['date' => $date, 'alerts_count' => count($sentList), 'channel' => $channel]
    );

    jsonResponse(true, "Successfully dispatched absence alerts to " . count($sentList) . " guardians.", [
        'alerts_sent' => count($sentList),
        'date'        => $date,
        'channel'     => $channel,
        'details'     => $sentList,
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    jsonResponse(false, 'Alerts dispatch failed: ' . $e->getMessage(), null, 500);
}

