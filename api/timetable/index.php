<?php
// api/timetable/index.php
// Timetable scheduling engine with automated teacher and room clash prevention
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth_guard.php';

$user = requireAuth($pdo);
$schoolId = (int)$user['school_id'];
$branchId = !empty($_GET['branch_id']) ? (int)$_GET['branch_id'] : ($user['branch_id'] ? (int)$user['branch_id'] : 1);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $classId = !empty($_GET['class_id']) ? (int)$_GET['class_id'] : null;
    $teacherId = !empty($_GET['teacher_id']) ? (int)$_GET['teacher_id'] : null;

    $sql = "
        SELECT 
            ts.*,
            c.name as class_name,
            sub.name as subject_name,
            sub.code as subject_code,
            u.name as teacher_name
        FROM timetable_slots ts
        LEFT JOIN classes c ON ts.class_id = c.id
        LEFT JOIN subjects sub ON ts.subject_id = sub.id
        LEFT JOIN users u ON ts.teacher_id = u.id
        WHERE ts.school_id = :school_id
    ";
    $params = [':school_id' => $schoolId];

    if ($branchId) {
        $sql .= " AND (ts.branch_id = :branch_id OR ts.branch_id IS NULL)";
        $params[':branch_id'] = $branchId;
    }

    if ($classId) {
        $sql .= " AND ts.class_id = :class_id";
        $params[':class_id'] = $classId;
    }

    if ($teacherId) {
        $sql .= " AND ts.teacher_id = :teacher_id";
        $params[':teacher_id'] = $teacherId;
    }

    $sql .= " ORDER BY FIELD(ts.day_of_week, 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'), ts.period_no ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $slots = $stmt->fetchAll();

    // Fetch classes and teachers for modal pickers
    $classes = $pdo->prepare("SELECT id, name FROM classes WHERE school_id = :s ORDER BY display_order ASC");
    $classes->execute([':s' => $schoolId]);

    $teachers = $pdo->prepare("
        SELECT u.id, u.name, u.email 
        FROM users u 
        JOIN roles r ON u.role_id = r.id 
        WHERE u.school_id = :s AND r.slug IN ('teacher', 'academic', 'principal')
    ");
    $teachers->execute([':s' => $schoolId]);

    $subjects = $pdo->prepare("SELECT id, name, code FROM subjects WHERE school_id = :s ORDER BY name ASC");
    $subjects->execute([':s' => $schoolId]);

    jsonResponse(true, 'Timetable schedule retrieved.', [
        'slots'    => $slots,
        'classes'  => $classes->fetchAll(),
        'teachers' => $teachers->fetchAll(),
        'subjects' => $subjects->fetchAll(),
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAuth($pdo, ['superadmin', 'admin', 'principal', 'academic']);

    $input = getJsonInput();
    $classId   = !empty($input['class_id']) ? (int)$input['class_id'] : null;
    $subjectId = !empty($input['subject_id']) ? (int)$input['subject_id'] : null;
    $teacherId = !empty($input['teacher_id']) ? (int)$input['teacher_id'] : null;
    $dayOfWeek = trim((string)($input['day_of_week'] ?? 'Sunday'));
    $periodNo  = (int)($input['period_no'] ?? 1);
    $startTime = trim((string)($input['start_time'] ?? '10:00:00'));
    $endTime   = trim((string)($input['end_time'] ?? '10:45:00'));
    $roomNo    = trim((string)($input['room_no'] ?? 'Room 101'));

    if (!$classId || !$subjectId || !$teacherId) {
        jsonResponse(false, 'Class, Subject, and Teacher are required.', null, 400);
    }

    // 1. Clash Detection: Check if Teacher is already booked at this day & period in this branch
    $teacherClashStmt = $pdo->prepare("
        SELECT ts.*, c.name as clashing_class, u.name as teacher_name 
        FROM timetable_slots ts
        JOIN classes c ON ts.class_id = c.id
        JOIN users u ON ts.teacher_id = u.id
        WHERE ts.branch_id = :branch_id 
          AND ts.teacher_id = :teacher_id 
          AND ts.day_of_week = :day 
          AND ts.period_no = :period
        LIMIT 1
    ");
    $teacherClashStmt->execute([
        ':branch_id'   => $branchId,
        ':teacher_id'  => $teacherId,
        ':day'         => $dayOfWeek,
        ':period'      => $periodNo,
    ]);
    $tClash = $teacherClashStmt->fetch();

    if ($tClash) {
        jsonResponse(false, "TIMETABLE CLASH DETECTED: Teacher {$tClash['teacher_name']} is already teaching {$tClash['clashing_class']} on {$dayOfWeek} Period {$periodNo}.", [
            'clash_type'    => 'teacher_clash',
            'clashing_slot' => $tClash,
        ], 409);
    }

    // 2. Clash Detection: Check if Room is already occupied at this day & period
    if (!empty($roomNo)) {
        $roomClashStmt = $pdo->prepare("
            SELECT ts.*, c.name as clashing_class 
            FROM timetable_slots ts
            JOIN classes c ON ts.class_id = c.id
            WHERE ts.branch_id = :branch_id 
              AND LOWER(ts.room_no) = LOWER(:room) 
              AND ts.day_of_week = :day 
              AND ts.period_no = :period
            LIMIT 1
        ");
        $roomClashStmt->execute([
            ':branch_id' => $branchId,
            ':room'      => $roomNo,
            ':day'       => $dayOfWeek,
            ':period'    => $periodNo,
        ]);
        $rClash = $roomClashStmt->fetch();

        if ($rClash) {
            jsonResponse(false, "TIMETABLE CLASH DETECTED: {$roomNo} is already occupied by {$rClash['clashing_class']} on {$dayOfWeek} Period {$periodNo}.", [
                'clash_type'    => 'room_clash',
                'clashing_slot' => $rClash,
            ], 409);
        }
    }

    // Insert slot safely
    $insert = $pdo->prepare("
        INSERT INTO timetable_slots 
        (school_id, branch_id, class_id, subject_id, teacher_id, day_of_week, period_no, start_time, end_time, room_no)
        VALUES 
        (:school_id, :branch_id, :class_id, :subject_id, :teacher_id, :day, :period, :start, :end, :room)
    ");

    $insert->execute([
        ':school_id'  => $schoolId,
        ':branch_id'  => $branchId,
        ':class_id'   => $classId,
        ':subject_id' => $subjectId,
        ':teacher_id' => $teacherId,
        ':day'        => $dayOfWeek,
        ':period'     => $periodNo,
        ':start'      => $startTime,
        ':end'        => $endTime,
        ':room'       => $roomNo,
    ]);

    $slotId = (int)$pdo->lastInsertId();

    logAuditAction(
        $pdo,
        $schoolId,
        $branchId,
        (int)$user['id'],
        $user['name'],
        $user['role_slug'],
        'TIMETABLE_SLOT_CREATE',
        'timetable_slots',
        (string)$slotId,
        null,
        ['class_id' => $classId, 'day' => $dayOfWeek, 'period' => $periodNo, 'teacher_id' => $teacherId, 'room' => $roomNo]
    );

    jsonResponse(true, "Timetable slot for {$dayOfWeek} Period {$periodNo} scheduled with clash validation.", [
        'slot_id' => $slotId,
    ]);
}

jsonResponse(false, 'Method not allowed.', null, 405);

