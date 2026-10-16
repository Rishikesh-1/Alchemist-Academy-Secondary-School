<?php
// api/classes/index.php
// Academic Class & Section Management with Enrolled Student Telemetry
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth_guard.php';

$user = requireAuth($pdo);
$schoolId = (int)$user['school_id'];
$branchId = !empty($_GET['branch_id']) ? (int)$_GET['branch_id'] : ($user['branch_id'] ? (int)$user['branch_id'] : 1);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // 1. Fetch Classes with student counts and branch details
    $sql = "
        SELECT 
            c.*,
            b.name as branch_name,
            (SELECT COUNT(*) FROM students s WHERE s.class_id = c.id AND s.status = 'active') as student_count
        FROM classes c
        LEFT JOIN branches b ON c.branch_id = b.id
        WHERE c.school_id = :school_id
        ORDER BY c.order_index ASC, c.name ASC
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':school_id' => $schoolId]);
    $classes = $stmt->fetchAll();

    // 2. Fetch all sections with assigned class teacher names
    $secSql = "
        SELECT 
            sec.*,
            u.name as class_teacher_name,
            u.email as class_teacher_email
        FROM sections sec
        LEFT JOIN users u ON sec.class_teacher_id = u.id
        WHERE sec.school_id = :school_id
        ORDER BY sec.name ASC
    ";
    $secStmt = $pdo->prepare($secSql);
    $secStmt->execute([':school_id' => $schoolId]);
    $sections = $secStmt->fetchAll();

    // Group sections by class_id
    $sectionsByClass = [];
    foreach ($sections as $sec) {
        $cid = (int)$sec['class_id'];
        if (!isset($sectionsByClass[$cid])) {
            $sectionsByClass[$cid] = [];
        }
        $sectionsByClass[$cid][] = $sec;
    }

    // Attach sections to each class
    foreach ($classes as &$c) {
        $cid = (int)$c['id'];
        $c['sections'] = $sectionsByClass[$cid] ?? [];
        // Compute total capacity from sections
        $totalCap = 0;
        foreach ($c['sections'] as $s) {
            $totalCap += (int)($s['capacity'] ?? 40);
        }
        $c['total_capacity'] = $totalCap > 0 ? $totalCap : 40;
        $c['primary_teacher'] = !empty($c['sections'][0]['class_teacher_name']) ? $c['sections'][0]['class_teacher_name'] : 'Unassigned';
        $c['primary_room'] = !empty($c['sections'][0]['room_no']) ? $c['sections'][0]['room_no'] : 'TBD';
    }
    unset($c);

    // 3. Fetch teachers for dropdowns
    $teachersStmt = $pdo->prepare("
        SELECT u.id, u.name, u.email 
        FROM users u 
        JOIN roles r ON u.role_id = r.id 
        WHERE u.school_id = :school_id AND r.name IN ('teacher', 'principal', 'admin')
        ORDER BY u.name ASC
    ");
    $teachersStmt->execute([':school_id' => $schoolId]);
    $teachers = $teachersStmt->fetchAll();

    jsonResponse(true, 'Classes and section cohorts retrieved successfully.', [
        'classes'  => $classes,
        'teachers' => $teachers,
        'count'    => count($classes),
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAuth($pdo, ['superadmin', 'admin', 'principal', 'teacher', 'academic']);

    $input = getJsonInput();
    $action = $input['action'] ?? (!empty($input['id']) ? 'update_class' : 'create_class');

    try {
        if ($action === 'create_class') {
            $className      = trim((string)($input['name'] ?? ''));
            $faculty        = trim((string)($input['faculty'] ?? 'General'));
            $orderIndex     = max(1, (int)($input['order_index'] ?? 1));
            $targetBranchId = !empty($input['branch_id']) ? (int)$input['branch_id'] : $branchId;

            // Initial section details
            $sectionName    = trim((string)($input['section_name'] ?? 'Section A'));
            $roomNo         = trim((string)($input['room_no'] ?? 'Room 101'));
            $classTeacherId = !empty($input['class_teacher_id']) && (int)$input['class_teacher_id'] > 0 ? (int)$input['class_teacher_id'] : null;
            $capacity       = max(10, (int)($input['capacity'] ?? 40));

            if (empty($className)) {
                jsonResponse(false, 'Class name is required (e.g. Grade 10 or Grade 11 Science).', null, 400);
            }

            // Verify target branch exists
            if ($targetBranchId) {
                $bChk = $pdo->prepare("SELECT id FROM branches WHERE id = :id AND school_id = :school_id LIMIT 1");
                $bChk->execute([':id' => $targetBranchId, ':school_id' => $schoolId]);
                if (!$bChk->fetch()) {
                    $targetBranchId = null;
                }
            }

            // Verify teacher exists
            if ($classTeacherId) {
                $tChk = $pdo->prepare("SELECT id FROM users WHERE id = :id AND school_id = :school_id LIMIT 1");
                $tChk->execute([':id' => $classTeacherId, ':school_id' => $schoolId]);
                if (!$tChk->fetch()) {
                    $classTeacherId = null;
                }
            }

            $stmt = $pdo->prepare("
                INSERT INTO classes (school_id, branch_id, name, order_index, faculty)
                VALUES (:school_id, :branch_id, :name, :order_index, :faculty)
            ");
            $stmt->execute([
                ':school_id'    => $schoolId,
                ':branch_id'    => $targetBranchId,
                ':name'         => $className,
                ':order_index'  => $orderIndex,
                ':faculty'      => $faculty,
            ]);
            $newClassId = (int)$pdo->lastInsertId();

            // Create default section for this class
            $secStmt = $pdo->prepare("
                INSERT INTO sections (school_id, branch_id, class_id, name, room_no, class_teacher_id, capacity)
                VALUES (:school_id, :branch_id, :class_id, :name, :room_no, :teacher_id, :capacity)
            ");
            $secStmt->execute([
                ':school_id'   => $schoolId,
                ':branch_id'   => $targetBranchId,
                ':class_id'    => $newClassId,
                ':name'        => $sectionName,
                ':room_no'     => $roomNo,
                ':teacher_id'  => $classTeacherId,
                ':capacity'    => $capacity,
            ]);

            // Audit Log
            logAuditAction(
                $pdo,
                $schoolId,
                $targetBranchId,
                (int)$user['id'],
                $user['name'],
                $user['role_slug'],
                'CLASS_CREATE',
                'classes',
                (string)$newClassId,
                null,
                ['name' => $className, 'faculty' => $faculty, 'section' => $sectionName]
            );

            jsonResponse(true, "Class {$className} registered successfully with {$sectionName}.", [
                'class_id' => $newClassId,
            ]);
        }

        if ($action === 'update_class') {
            $classId     = (int)($input['id'] ?? 0);
            $className   = trim((string)($input['name'] ?? ''));
            $faculty     = trim((string)($input['faculty'] ?? 'General'));
            $orderIndex  = max(1, (int)($input['order_index'] ?? 1));
            $roomNo      = trim((string)($input['room_no'] ?? ''));
            $classTeacherId = !empty($input['class_teacher_id']) && (int)$input['class_teacher_id'] > 0 ? (int)$input['class_teacher_id'] : null;
            $capacity    = max(10, (int)($input['capacity'] ?? 40));

            if ($classId <= 0 || empty($className)) {
                jsonResponse(false, 'Valid class ID and name are required.', null, 400);
            }

            if ($classTeacherId) {
                $tChk = $pdo->prepare("SELECT id FROM users WHERE id = :id AND school_id = :school_id LIMIT 1");
                $tChk->execute([':id' => $classTeacherId, ':school_id' => $schoolId]);
                if (!$tChk->fetch()) {
                    $classTeacherId = null;
                }
            }

            $stmt = $pdo->prepare("
                UPDATE classes 
                SET name = :name, faculty = :faculty, order_index = :order_index
                WHERE id = :id AND school_id = :school_id
            ");
            $stmt->execute([
                ':name'         => $className,
                ':faculty'      => $faculty,
                ':order_index'  => $orderIndex,
                ':id'           => $classId,
                ':school_id'    => $schoolId,
            ]);

            // If primary section exists, update its room, teacher, and capacity
            $secCheck = $pdo->prepare("SELECT id FROM sections WHERE class_id = :cid AND school_id = :sid ORDER BY id ASC LIMIT 1");
            $secCheck->execute([':cid' => $classId, ':sid' => $schoolId]);
            $firstSecId = (int)$secCheck->fetchColumn();

            if ($firstSecId > 0) {
                $secUpdate = $pdo->prepare("
                    UPDATE sections 
                    SET room_no = :room_no, class_teacher_id = :teacher_id, capacity = :capacity
                    WHERE id = :id AND school_id = :sid
                ");
                $secUpdate->execute([
                    ':room_no'    => $roomNo,
                    ':teacher_id' => $classTeacherId,
                    ':capacity'   => $capacity,
                    ':id'         => $firstSecId,
                    ':sid'        => $schoolId,
                ]);
            }

            // Audit Log
            logAuditAction(
                $pdo,
                $schoolId,
                $branchId,
                (int)$user['id'],
                $user['name'],
                $user['role_slug'],
                'CLASS_UPDATE',
                'classes',
                (string)$classId,
                null,
                ['name' => $className, 'faculty' => $faculty]
            );

            jsonResponse(true, "Class {$className} updated successfully.");
        }

        if ($action === 'delete_class') {
            $classId = (int)($input['id'] ?? 0);
            if ($classId <= 0) {
                jsonResponse(false, 'Valid class ID required to delete.', null, 400);
            }

            // Check if active students enrolled
            $stdCheck = $pdo->prepare("SELECT COUNT(*) FROM students WHERE class_id = :cid AND status = 'active'");
            $stdCheck->execute([':cid' => $classId]);
            $studentCount = (int)$stdCheck->fetchColumn();

            if ($studentCount > 0) {
                jsonResponse(false, "Cannot delete class: {$studentCount} active students are currently enrolled. Reassign students first.", null, 400);
            }

            $delStmt = $pdo->prepare("DELETE FROM classes WHERE id = :id AND school_id = :school_id");
            $delStmt->execute([':id' => $classId, ':school_id' => $schoolId]);

            jsonResponse(true, 'Academic class deleted successfully.');
        }

        if ($action === 'add_section') {
            $classId        = (int)($input['class_id'] ?? 0);
            $sectionName    = trim((string)($input['name'] ?? 'Section B'));
            $roomNo         = trim((string)($input['room_no'] ?? 'Room 102'));
            $classTeacherId = !empty($input['class_teacher_id']) && (int)$input['class_teacher_id'] > 0 ? (int)$input['class_teacher_id'] : null;
            $capacity       = max(10, (int)($input['capacity'] ?? 40));

            if ($classId <= 0 || empty($sectionName)) {
                jsonResponse(false, 'Valid class ID and section name are required.', null, 400);
            }

            if ($classTeacherId) {
                $tChk = $pdo->prepare("SELECT id FROM users WHERE id = :id AND school_id = :school_id LIMIT 1");
                $tChk->execute([':id' => $classTeacherId, ':school_id' => $schoolId]);
                if (!$tChk->fetch()) {
                    $classTeacherId = null;
                }
            }

            $secStmt = $pdo->prepare("
                INSERT INTO sections (school_id, branch_id, class_id, name, room_no, class_teacher_id, capacity)
                VALUES (:school_id, :branch_id, :class_id, :name, :room_no, :teacher_id, :capacity)
            ");
            $secStmt->execute([
                ':school_id'   => $schoolId,
                ':branch_id'   => $branchId,
                ':class_id'    => $classId,
                ':name'        => $sectionName,
                ':room_no'     => $roomNo,
                ':teacher_id'  => $classTeacherId,
                ':capacity'    => $capacity,
            ]);

            jsonResponse(true, "Section {$sectionName} added to class.");
        }

        jsonResponse(false, 'Invalid action specified.', null, 400);
    } catch (PDOException $e) {
        jsonResponse(false, 'Database operation error: ' . $e->getMessage(), null, 500);
    }
}

