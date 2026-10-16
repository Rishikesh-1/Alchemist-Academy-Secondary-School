<?php
// api/behavior/index.php
// Student Behavior, Demerit Points, and Conduct Discipline Tracking
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth_guard.php';

$user = requireAuth($pdo);
$schoolId = (int)$user['school_id'];
$branchId = !empty($_GET['branch_id']) ? (int)$_GET['branch_id'] : ($user['branch_id'] ? (int)$user['branch_id'] : 1);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $studentId = !empty($_GET['student_id']) ? (int)$_GET['student_id'] : null;

    $sql = "
        SELECT 
            sbr.*,
            s.first_name,
            s.last_name,
            s.admission_no,
            s.roll_no,
            c.name as class_name,
            u.name as reported_by_name
        FROM student_behavior_records sbr
        JOIN students s ON sbr.student_id = s.id
        LEFT JOIN classes c ON s.class_id = c.id
        LEFT JOIN users u ON sbr.reported_by_user_id = u.id
        WHERE sbr.school_id = :school_id
    ";
    $params = [':school_id' => $schoolId];

    if ($studentId) {
        $sql .= " AND sbr.student_id = :sid";
        $params[':sid'] = $studentId;
    }

    $sql .= " ORDER BY sbr.incident_date DESC, sbr.id DESC LIMIT 100";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $records = $stmt->fetchAll();

    jsonResponse(true, 'Student behavior records retrieved.', [
        'records' => $records,
        'count'   => count($records),
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAuth($pdo, ['superadmin', 'admin', 'principal', 'teacher', 'academic']);

    $input = getJsonInput();
    $studentId     = (int)($input['student_id'] ?? 0);
    $incidentType  = in_array($input['incident_type'] ?? '', ['positive', 'disciplinary', 'counseling'], true) ? $input['incident_type'] : 'positive';
    $title         = trim((string)($input['title'] ?? ''));
    $points        = (int)($input['points'] ?? ($incidentType === 'positive' ? 5 : -5));
    $description   = trim((string)($input['description'] ?? ''));
    $actionTaken   = trim((string)($input['action_taken'] ?? 'Recorded in Student Portfolio'));
    $notifyGuardian = !empty($input['guardian_notified']) ? 1 : 0;
    $incidentDate  = trim((string)($input['incident_date'] ?? date('Y-m-d')));

    if (!$studentId || empty($title)) {
        jsonResponse(false, 'student_id and title are required.', null, 400);
    }

    $stmt = $pdo->prepare("
        INSERT INTO student_behavior_records 
        (school_id, branch_id, student_id, incident_type, title, points, description, action_taken, reported_by_user_id, incident_date, guardian_notified)
        VALUES (:s, :b, :sid, :itype, :title, :pts, :desc, :act, :uid, :idate, :notif)
    ");
    $stmt->execute([
        ':s'     => $schoolId,
        ':b'     => $branchId,
        ':sid'   => $studentId,
        ':itype' => $incidentType,
        ':title' => $title,
        ':pts'   => $points,
        ':desc'  => $description,
        ':act'   => $actionTaken,
        ':uid'   => (int)$user['id'],
        ':idate' => $incidentDate,
        ':notif' => $notifyGuardian,
    ]);

    $newId = (int)$pdo->lastInsertId();

    logAuditAction(
        $pdo,
        $schoolId,
        $branchId,
        (int)$user['id'],
        $user['name'],
        $user['role_slug'],
        'STUDENT_BEHAVIOR_LOG',
        'student_behavior_records',
        (string)$newId,
        null,
        ['student_id' => $studentId, 'type' => $incidentType, 'points' => $points, 'title' => $title]
    );

    jsonResponse(true, "Behavior incident recorded successfully ({$points} pts).", ['id' => $newId]);
}

jsonResponse(false, 'Method not allowed.', null, 405);

