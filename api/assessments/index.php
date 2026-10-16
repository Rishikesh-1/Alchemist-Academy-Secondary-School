<?php
// api/assessments/index.php
// Multi-System Examinations: CBSE, Standard Term Exams, and Online CBT Quizzes
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth_guard.php';

$user = requireAuth($pdo);
$schoolId = (int)$user['school_id'];
$branchId = !empty($_GET['branch_id']) ? (int)$_GET['branch_id'] : ($user['branch_id'] ? (int)$user['branch_id'] : 1);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $classId = !empty($_GET['class_id']) ? (int)$_GET['class_id'] : null;
    $system  = !empty($_GET['system']) ? trim((string)$_GET['system']) : null; // 'cbse', 'standard', 'online_quiz'

    $sql = "
        SELECT 
            oa.*,
            c.name as class_name,
            s.name as subject_name
        FROM online_assessments oa
        LEFT JOIN classes c ON oa.class_id = c.id
        LEFT JOIN subjects s ON oa.subject_id = s.id
        WHERE oa.school_id = :school_id
    ";
    $params = [':school_id' => $schoolId];

    if ($classId) {
        $sql .= " AND oa.class_id = :cid";
        $params[':cid'] = $classId;
    }

    if ($system) {
        $sql .= " AND oa.exam_system = :sys";
        $params[':sys'] = $system;
    }

    $sql .= " ORDER BY oa.start_time DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $assessments = $stmt->fetchAll();

    foreach ($assessments as &$a) {
        $a['questions_json'] = !empty($a['questions_json']) ? json_decode($a['questions_json'], true) : [];
    }
    unset($a);

    jsonResponse(true, 'Assessments and examinations retrieved.', [
        'assessments' => $assessments,
        'count'       => count($assessments),
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAuth($pdo, ['superadmin', 'admin', 'principal', 'teacher', 'academic']);

    $input = getJsonInput();
    $classId      = (int)($input['class_id'] ?? 1);
    $subjectId    = (int)($input['subject_id'] ?? 1);
    $examSystem   = in_array($input['exam_system'] ?? '', ['cbse', 'standard', 'online_quiz'], true) ? $input['exam_system'] : 'online_quiz';
    $title        = trim((string)($input['title'] ?? ''));
    $totalMarks   = max(10, (int)($input['total_marks'] ?? 50));
    $duration     = max(15, (int)($input['duration_minutes'] ?? 60));
    $passMarks    = max(5, (int)($input['pass_marks'] ?? 20));
    $startTime    = trim((string)($input['start_time'] ?? date('Y-m-d H:i:s')));
    $endTime      = trim((string)($input['end_time'] ?? date('Y-m-d H:i:s', strtotime('+2 days'))));
    $questions    = $input['questions'] ?? [];

    if (empty($title)) {
        jsonResponse(false, 'Assessment title is required.', null, 400);
    }

    $stmt = $pdo->prepare("
        INSERT INTO online_assessments 
        (school_id, branch_id, class_id, subject_id, exam_system, title, total_marks, duration_minutes, pass_marks, start_time, end_time, questions_json, status)
        VALUES (:s, :b, :c, :sub, :sys, :title, :tm, :dur, :pm, :st, :et, :qjson, 'published')
    ");
    $stmt->execute([
        ':s'     => $schoolId,
        ':b'     => $branchId,
        ':c'     => $classId,
        ':sub'   => $subjectId,
        ':sys'   => $examSystem,
        ':title' => $title,
        ':tm'    => $totalMarks,
        ':dur'   => $duration,
        ':pm'    => $passMarks,
        ':st'    => $startTime,
        ':et'    => $endTime,
        ':qjson' => json_encode($questions),
    ]);

    $newId = (int)$pdo->lastInsertId();

    jsonResponse(true, "Assessment '{$title}' ({$examSystem}) published.", ['id' => $newId]);
}

jsonResponse(false, 'Method not allowed.', null, 405);

