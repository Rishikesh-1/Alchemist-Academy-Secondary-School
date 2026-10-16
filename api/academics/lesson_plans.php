<?php
// api/academics/lesson_plans.php
// Academics & Lesson Plan: Curriculum structuring, syllabus coverage & unit progress
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth_guard.php';

$user = requireAuth($pdo);
$schoolId = (int)$user['school_id'];
$branchId = !empty($_GET['branch_id']) ? (int)$_GET['branch_id'] : ($user['branch_id'] ? (int)$user['branch_id'] : 1);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $classId = !empty($_GET['class_id']) ? (int)$_GET['class_id'] : null;
    $subjectId = !empty($_GET['subject_id']) ? (int)$_GET['subject_id'] : null;

    $sql = "
        SELECT lp.*, 
               c.name as class_name, 
               s.name as subject_name, s.code as subject_code,
               u.name as teacher_name
        FROM lesson_plans lp
        JOIN classes c ON lp.class_id = c.id
        JOIN subjects s ON lp.subject_id = s.id
        JOIN users u ON lp.teacher_id = u.id
        WHERE lp.school_id = :school_id
    ";
    $params = [':school_id' => $schoolId];

    if ($classId) {
        $sql .= " AND lp.class_id = :class_id";
        $params[':class_id'] = $classId;
    }
    if ($subjectId) {
        $sql .= " AND lp.subject_id = :subject_id";
        $params[':subject_id'] = $subjectId;
    }

    $sql .= " ORDER BY lp.planned_date ASC, lp.week_no ASC, lp.id ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $plans = $stmt->fetchAll();

    // Summary calculation
    $totalPlans = count($plans);
    $completed = 0;
    $inProgress = 0;
    $totalPercent = 0;
    foreach ($plans as $p) {
        $totalPercent += (int)$p['completion_percentage'];
        if ($p['completion_status'] === 'completed') $completed++;
        elseif ($p['completion_status'] === 'in_progress') $inProgress++;
    }
    $avgProgress = $totalPlans > 0 ? round($totalPercent / $totalPlans, 1) : 0;

    // Fetch classes and subjects for dropdowns
    $classStmt = $pdo->prepare("SELECT id, name FROM classes WHERE school_id = :school_id ORDER BY name ASC");
    $classStmt->execute([':school_id' => $schoolId]);
    $classes = $classStmt->fetchAll();

    $subStmt = $pdo->prepare("SELECT id, name, code FROM subjects WHERE school_id = :school_id ORDER BY name ASC");
    $subStmt->execute([':school_id' => $schoolId]);
    $subjects = $subStmt->fetchAll();

    jsonResponse(true, 'Lesson plans and syllabus data retrieved.', [
        'plans'    => $plans,
        'classes'  => $classes,
        'subjects' => $subjects,
        'summary'  => [
            'total_units'  => $totalPlans,
            'completed'    => $completed,
            'in_progress'  => $inProgress,
            'avg_progress' => $avgProgress,
        ],
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAuth($pdo, ['superadmin', 'admin', 'principal', 'teacher', 'academic']);

    $input = getJsonInput();
    $action = $input['action'] ?? 'add_plan';

    if ($action === 'add_plan') {
        $classId            = (int)($input['class_id'] ?? 1);
        $subjectId          = (int)($input['subject_id'] ?? 1);
        $teacherId          = !empty($input['teacher_id']) ? (int)$input['teacher_id'] : (int)$user['id'];
        $weekNo             = max(1, (int)($input['week_no'] ?? $input['week_number'] ?? 1));
        $unitName           = trim((string)($input['unit_name'] ?? 'Unit 1'));
        $topicTitle         = trim((string)($input['topic_title'] ?? $input['title'] ?? $input['topic'] ?? ''));
        $learningObjectives = trim((string)($input['learning_objectives'] ?? $input['learning_outcomes'] ?? ''));
        $teachingMethod     = trim((string)($input['teaching_method'] ?? 'Interactive Class Lecture'));
        $plannedDate        = trim((string)($input['planned_date'] ?? date('Y-m-d')));

        if (empty($topicTitle)) {
            jsonResponse(false, 'Topic title is required.', null, 400);
        }

        $stmt = $pdo->prepare("
            INSERT INTO lesson_plans 
            (school_id, branch_id, class_id, subject_id, teacher_id, week_no, unit_name, topic_title, learning_objectives, teaching_method, planned_date, completion_status, completion_percentage)
            VALUES (:school_id, :branch_id, :class_id, :subject_id, :teacher_id, :week_no, :unit_name, :topic_title, :learning_objectives, :teaching_method, :planned_date, 'planned', 0)
        ");
        $stmt->execute([
            ':school_id'           => $schoolId,
            ':branch_id'           => $branchId,
            ':class_id'            => $classId,
            ':subject_id'          => $subjectId,
            ':teacher_id'          => $teacherId,
            ':week_no'             => $weekNo,
            ':unit_name'           => $unitName,
            ':topic_title'         => $topicTitle,
            ':learning_objectives' => $learningObjectives,
            ':teaching_method'     => $teachingMethod,
            ':planned_date'        => $plannedDate,
        ]);

        $newId = (int)$pdo->lastInsertId();
        jsonResponse(true, 'Lesson plan added successfully.', [
            'id'      => $newId,
            'plan_id' => $newId,
        ]);
    }

    if ($action === 'update_progress') {
        $planId     = (int)($input['id'] ?? $input['plan_id'] ?? 0);
        $status     = in_array($input['completion_status'] ?? '', ['planned', 'in_progress', 'completed'], true) ? $input['completion_status'] : 'in_progress';
        $percentage = min(100, max(0, (int)($input['completion_percentage'] ?? 0)));

        if ($planId <= 0) {
            jsonResponse(false, 'Valid lesson plan ID is required.', null, 400);
        }

        if ($status === 'completed' && $percentage < 100) {
            $percentage = 100;
        }

        $stmt = $pdo->prepare("
            UPDATE lesson_plans 
            SET completion_status = :status, completion_percentage = :pct
            WHERE id = :id AND school_id = :school_id
        ");
        $stmt->execute([
            ':status'    => $status,
            ':pct'       => $percentage,
            ':id'        => $planId,
            ':school_id' => $schoolId,
        ]);

        jsonResponse(true, 'Lesson progress updated successfully.');
    }

    if ($action === 'delete_plan') {
        $planId = (int)($input['id'] ?? $input['plan_id'] ?? 0);
        if ($planId <= 0) {
            jsonResponse(false, 'Valid lesson plan ID is required for deletion.', null, 400);
        }

        $stmt = $pdo->prepare("DELETE FROM lesson_plans WHERE id = :id AND school_id = :school_id");
        $stmt->execute([':id' => $planId, ':school_id' => $schoolId]);
        jsonResponse(true, 'Lesson plan deleted successfully.');
    }

    jsonResponse(false, 'Invalid action specified.', null, 400);
}

