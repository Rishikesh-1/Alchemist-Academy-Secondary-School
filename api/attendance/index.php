<?php
// api/attendance/index.php
// Daily & per-period attendance marking engine with bulk class roll-call
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth_guard.php';

$user = requireAuth($pdo);
$schoolId = (int)$user['school_id'];
$branchId = !empty($_GET['branch_id']) ? (int)$_GET['branch_id'] : ($user['branch_id'] ? (int)$user['branch_id'] : null);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $date = trim((string)($_GET['date'] ?? date('Y-m-d')));
    $classId = !empty($_GET['class_id']) ? (int)$_GET['class_id'] : null;
    $type = trim((string)($_GET['type'] ?? 'daily')); // 'daily', 'period_1', etc.

    // Fetch students of this class
    $sql = "
        SELECT 
            s.id as student_id,
            s.admission_no,
            s.roll_no,
            s.first_name,
            s.last_name,
            s.guardian_name,
            s.guardian_phone,
            c.name as class_name,
            COALESCE(ar.status, 'unmarked') as attendance_status,
            ar.remarks as attendance_remarks,
            ar.marked_at
        FROM students s
        LEFT JOIN classes c ON s.class_id = c.id
        LEFT JOIN attendance_records ar ON ar.student_id = s.id 
            AND ar.date_ad = :att_date 
            AND ar.type = :att_type
        WHERE s.school_id = :school_id AND s.status = 'active'
    ";

    $params = [
        ':school_id' => $schoolId,
        ':att_date'  => $date,
        ':att_type'  => $type,
    ];

    if ($branchId) {
        $sql .= " AND (s.branch_id = :branch_id OR s.branch_id IS NULL)";
        $params[':branch_id'] = $branchId;
    }

    if ($classId) {
        $sql .= " AND s.class_id = :class_id";
        $params[':class_id'] = $classId;
    }

    $sql .= " ORDER BY c.order_index ASC, s.roll_no ASC, s.first_name ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $roster = $stmt->fetchAll();

    // Summary counts
    $counts = [
        'total'    => count($roster),
        'present'  => 0,
        'absent'   => 0,
        'late'     => 0,
        'excused'  => 0,
        'unmarked' => 0,
    ];
    foreach ($roster as $r) {
        $st = $r['attendance_status'];
        if (isset($counts[$st])) {
            $counts[$st]++;
        } else {
            $counts['unmarked']++;
        }
    }

    jsonResponse(true, 'Attendance sheet retrieved.', [
        'date'     => $date,
        'type'     => $type,
        'class_id' => $classId,
        'summary'  => $counts,
        'roster'   => $roster,
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAuth($pdo, ['superadmin', 'admin', 'principal', 'teacher', 'academic']);

    $input = getJsonInput();
    $date = trim((string)($input['date'] ?? date('Y-m-d')));
    $type = trim((string)($input['attendance_type'] ?? $input['type'] ?? 'daily'));
    $periodNo = !empty($input['period_no']) ? (int)$input['period_no'] : null;
    $records = $input['records'] ?? []; // array of { student_id, status, remarks }

    if (empty($records) && !empty($input['student_id'])) {
        $records = [$input];
    }

    if (!is_array($records) || empty($records)) {
        jsonResponse(false, 'No attendance records provided to mark.', null, 400);
    }

    $pdo->beginTransaction();

    try {
        $stuInfoStmt = $pdo->prepare("SELECT class_id, section_id, branch_id FROM students WHERE id = :id");

        $upsert = $pdo->prepare("
            INSERT INTO attendance_records 
            (school_id, branch_id, class_id, section_id, student_id, type, period_no, date_ad, date_bs, status, remarks, marked_by)
            VALUES 
            (:school_id, :branch_id, :class_id, :section_id, :student_id, :type, :period_no, :date_ad, :date_bs, :status, :remarks, :marked_by)
            ON DUPLICATE KEY UPDATE 
                status = VALUES(status),
                remarks = VALUES(remarks),
                marked_by = VALUES(marked_by),
                updated_at = CURRENT_TIMESTAMP
        ");

        $marked = 0;
        foreach ($records as $r) {
            $studentId = (int)($r['student_id'] ?? 0);
            if ($studentId <= 0) continue;

            $status = strtolower(trim((string)($r['status'] ?? 'present')));
            if (!in_array($status, ['present', 'absent', 'late', 'half_day', 'excused'], true)) {
                $status = 'present';
            }
            $remarks = trim((string)($r['remarks'] ?? ''));

            $recClassId = !empty($r['class_id']) ? (int)$r['class_id'] : null;
            $recSectionId = !empty($r['section_id']) ? (int)$r['section_id'] : null;
            $recBranchId = !empty($r['branch_id']) ? (int)$r['branch_id'] : $branchId;

            if (!$recClassId || !$recSectionId) {
                $stuInfoStmt->execute([':id' => $studentId]);
                $sInfo = $stuInfoStmt->fetch();
                if ($sInfo) {
                    $recClassId = $recClassId ?: (int)($sInfo['class_id'] ?? 1);
                    $recSectionId = $recSectionId ?: (int)($sInfo['section_id'] ?? 1);
                    $recBranchId = $recBranchId ?: (!empty($sInfo['branch_id']) ? (int)$sInfo['branch_id'] : 1);
                }
            }

            // Fallback for non-null FKs if unassigned
            $recClassId = $recClassId ?: 1;
            $recSectionId = $recSectionId ?: 1;
            $recBranchId = $recBranchId ?: 1;

            $recDateBs = trim((string)($r['date_bs'] ?? $input['date_bs'] ?? '2083-06-30'));

            $upsert->execute([
                ':school_id'  => $schoolId,
                ':branch_id'  => $recBranchId,
                ':class_id'   => $recClassId,
                ':section_id' => $recSectionId,
                ':student_id' => $studentId,
                ':type'       => $type === 'period' ? 'period' : 'daily',
                ':period_no'  => $periodNo ?: (!empty($r['period_no']) ? (int)$r['period_no'] : null),
                ':date_ad'    => $date,
                ':date_bs'    => $recDateBs,
                ':status'     => $status,
                ':remarks'    => $remarks,
                ':marked_by'  => (int)$user['id'],
            ]);
            $marked++;
        }

        $pdo->commit();

        logAuditAction(
            $pdo,
            $schoolId,
            $branchId,
            (int)$user['id'],
            $user['name'],
            $user['role_slug'],
            'ATTENDANCE_BULK_MARK',
            'attendance_records',
            $date,
            null,
            ['date' => $date, 'type' => $type, 'records_count' => $marked]
        );

        jsonResponse(true, "Attendance successfully submitted for {$marked} students on {$date}.", [
            'marked_count' => $marked,
            'date'         => $date,
            'type'         => $type,
        ]);

    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        jsonResponse(false, 'Failed to save attendance: ' . $e->getMessage(), null, 500);
    }
}

jsonResponse(false, 'Method not allowed.', null, 405);

