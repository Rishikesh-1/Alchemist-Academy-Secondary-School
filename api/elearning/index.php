<?php
// api/elearning/index.php
// E-Learning Courses and Virtual Classroom Management (Zoom, Google Meet, Jitsi)
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth_guard.php';

$user = requireAuth($pdo);
$schoolId = (int)$user['school_id'];
$branchId = !empty($_GET['branch_id']) ? (int)$_GET['branch_id'] : ($user['branch_id'] ? (int)$user['branch_id'] : 1);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $classId = !empty($_GET['class_id']) ? (int)$_GET['class_id'] : null;

    // 1. Online Courses
    $courseSql = "
        SELECT oc.*, c.name as class_name, s.name as subject_name, u.name as teacher_name
        FROM online_courses oc
        LEFT JOIN classes c ON oc.class_id = c.id
        LEFT JOIN subjects s ON oc.subject_id = s.id
        LEFT JOIN users u ON oc.teacher_id = u.id
        WHERE oc.school_id = :school_id
    ";
    $cParams = [':school_id' => $schoolId];
    if ($classId) {
        $courseSql .= " AND oc.class_id = :cid";
        $cParams[':cid'] = $classId;
    }
    $courseSql .= " ORDER BY oc.id DESC";
    $cStmt = $pdo->prepare($courseSql);
    $cStmt->execute($cParams);
    $courses = $cStmt->fetchAll();

    // 2. Live Virtual Classes
    $liveSql = "
        SELECT olc.*, c.name as class_name, s.name as subject_name, u.name as teacher_name
        FROM online_live_classes olc
        LEFT JOIN classes c ON olc.class_id = c.id
        LEFT JOIN subjects s ON olc.subject_id = s.id
        LEFT JOIN users u ON olc.teacher_id = u.id
        WHERE olc.school_id = :school_id
    ";
    $lParams = [':school_id' => $schoolId];
    if ($classId) {
        $liveSql .= " AND olc.class_id = :cid";
        $lParams[':cid'] = $classId;
    }
    $liveSql .= " ORDER BY olc.start_time DESC";
    $lStmt = $pdo->prepare($liveSql);
    $lStmt->execute($lParams);
    $liveClasses = $lStmt->fetchAll();

    jsonResponse(true, 'E-learning modules and live classes retrieved.', [
        'courses'     => $courses,
        'liveClasses' => $liveClasses,
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAuth($pdo, ['superadmin', 'admin', 'principal', 'teacher', 'academic']);

    $input = getJsonInput();
    $action = $input['action'] ?? 'schedule_live';

    if ($action === 'create_course') {
        $classId      = (int)($input['class_id'] ?? 1);
        $subjectId    = (int)($input['subject_id'] ?? 1);
        $teacherId    = !empty($input['teacher_id']) ? (int)$input['teacher_id'] : (int)$user['id'];
        $title        = trim((string)($input['title'] ?? ''));
        $description  = trim((string)($input['description'] ?? ''));
        $thumbnailUrl = trim((string)($input['thumbnail_url'] ?? ''));
        $totalLessons = max(1, (int)($input['total_lessons'] ?? 10));
        $status       = in_array($input['course_status'] ?? '', ['published', 'draft', 'archived'], true) ? $input['course_status'] : 'published';

        if (empty($title)) {
            jsonResponse(false, 'Course title is required.', null, 400);
        }

        $stmt = $pdo->prepare("
            INSERT INTO online_courses 
            (school_id, branch_id, class_id, subject_id, teacher_id, title, description, thumbnail_url, total_lessons, course_status)
            VALUES (:s, :b, :c, :sub, :t, :title, :desc, :thumb, :lessons, :status)
        ");
        $stmt->execute([
            ':s'       => $schoolId,
            ':b'       => $branchId,
            ':c'       => $classId,
            ':sub'     => $subjectId,
            ':t'       => $teacherId,
            ':title'   => $title,
            ':desc'    => $description,
            ':thumb'   => $thumbnailUrl,
            ':lessons' => $totalLessons,
            ':status'  => $status,
        ]);

        $newId = (int)$pdo->lastInsertId();
        jsonResponse(true, "Course '{$title}' created successfully.", [
            'id'        => $newId,
            'course_id' => $newId,
        ]);
    }

    if ($action === 'delete_course') {
        $courseId = (int)($input['id'] ?? $input['course_id'] ?? 0);
        if ($courseId <= 0) {
            jsonResponse(false, 'Valid course ID required for deletion.', null, 400);
        }

        $stmt = $pdo->prepare("DELETE FROM online_courses WHERE id = :id AND school_id = :s");
        $stmt->execute([':id' => $courseId, ':s' => $schoolId]);
        jsonResponse(true, 'Course deleted successfully.');
    }

    if ($action === 'schedule_live' || $action === 'schedule_live_class') {
        $classId    = (int)($input['class_id'] ?? 1);
        $subjectId  = (int)($input['subject_id'] ?? 1);
        $title      = trim((string)($input['title'] ?? 'Live Classroom Session'));
        $platform   = in_array($input['platform'] ?? '', ['zoom', 'google_meet', 'jitsi'], true) ? $input['platform'] : 'zoom';
        $meetingId  = trim((string)($input['meeting_id'] ?? ''));
        $password   = trim((string)($input['meeting_password'] ?? ''));
        $joinUrl    = trim((string)($input['join_url'] ?? ''));
        $startTime  = trim((string)($input['start_time'] ?? date('Y-m-d H:i:s', strtotime('+1 hour'))));
        $duration   = max(15, (int)($input['duration_minutes'] ?? 45));

        if (empty($title) || empty($joinUrl)) {
            jsonResponse(false, 'Session title and valid meeting join URL are required.', null, 400);
        }

        $stmt = $pdo->prepare("
            INSERT INTO online_live_classes 
            (school_id, branch_id, class_id, subject_id, teacher_id, title, platform, meeting_id, meeting_password, join_url, start_time, duration_minutes, status)
            VALUES (:s, :b, :c, :sub, :t, :title, :plat, :mid, :pwd, :url, :st, :dur, 'scheduled')
        ");
        $stmt->execute([
            ':s'     => $schoolId,
            ':b'     => $branchId,
            ':c'     => $classId,
            ':sub'   => $subjectId,
            ':t'     => (int)$user['id'],
            ':title' => $title,
            ':plat'  => $platform,
            ':mid'   => $meetingId,
            ':pwd'   => $password,
            ':url'   => $joinUrl,
            ':st'    => $startTime,
            ':dur'   => $duration,
        ]);

        $newId = (int)$pdo->lastInsertId();

        logAuditAction(
            $pdo,
            $schoolId,
            $branchId,
            (int)$user['id'],
            $user['name'],
            $user['role_slug'],
            'LIVE_CLASS_SCHEDULE',
            'online_live_classes',
            (string)$newId,
            null,
            ['title' => $title, 'platform' => $platform, 'start_time' => $startTime]
        );

        jsonResponse(true, "Live class '{$title}' scheduled successfully.", [
            'id'       => $newId,
            'class_id' => $newId,
        ]);
    }

    if ($action === 'delete_live_class') {
        $liveId = (int)($input['id'] ?? $input['class_id'] ?? 0);
        if ($liveId <= 0) {
            jsonResponse(false, 'Valid live class ID required for deletion.', null, 400);
        }

        $stmt = $pdo->prepare("DELETE FROM online_live_classes WHERE id = :id AND school_id = :s");
        $stmt->execute([':id' => $liveId, ':s' => $schoolId]);
        jsonResponse(true, 'Live class deleted successfully.');
    }

    jsonResponse(false, "Invalid action '{$action}' specified.", null, 400);
}

jsonResponse(false, 'Method not allowed.', null, 405);

