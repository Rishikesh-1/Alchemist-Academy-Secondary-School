<?php
// api/students/index.php
// Student directory, profile details, and student creation with audit trail
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth_guard.php';

$user = requireAuth($pdo);
$schoolId = (int)$user['school_id'];
$branchId = !empty($_GET['branch_id']) ? (int)$_GET['branch_id'] : ($user['branch_id'] ? (int)$user['branch_id'] : null);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $search = trim((string)($_GET['search'] ?? ''));
    $classId = !empty($_GET['class_id']) ? (int)$_GET['class_id'] : null;
    $status = trim((string)($_GET['status'] ?? 'active'));

    $sql = "
        SELECT 
            s.*,
            s.permanent_address as address,
            c.name as class_name,
            sec.name as section_name,
            b.name as branch_name,
            CONCAT(COALESCE(ay.year_bs, ''), ' (', COALESCE(ay.year_ad, ''), ')') as academic_year_name
        FROM students s
        LEFT JOIN classes c ON s.class_id = c.id
        LEFT JOIN sections sec ON s.section_id = sec.id
        LEFT JOIN branches b ON s.branch_id = b.id
        LEFT JOIN academic_years ay ON s.academic_year_id = ay.id
        WHERE s.school_id = :school_id
    ";

    $params = [':school_id' => $schoolId];

    if ($branchId) {
        $sql .= " AND (s.branch_id = :branch_id OR s.branch_id IS NULL)";
        $params[':branch_id'] = $branchId;
    }

    if ($classId) {
        $sql .= " AND s.class_id = :class_id";
        $params[':class_id'] = $classId;
    }

    if (!empty($status) && $status !== 'all') {
        $sql .= " AND s.status = :status";
        $params[':status'] = $status;
    }

    if (!empty($search)) {
        $sql .= " AND (s.first_name LIKE :s1 OR s.last_name LIKE :s2 OR s.admission_no LIKE :s3 OR s.guardian_name LIKE :s4 OR s.guardian_phone LIKE :s5)";
        $wildcard = "%{$search}%";
        $params[':s1'] = $wildcard;
        $params[':s2'] = $wildcard;
        $params[':s3'] = $wildcard;
        $params[':s4'] = $wildcard;
        $params[':s5'] = $wildcard;
    }

    $sql .= " ORDER BY c.order_index ASC, s.roll_no ASC, s.first_name ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $students = $stmt->fetchAll();

    // Decode JSON documents field for each student
    foreach ($students as &$st) {
        $st['documents'] = !empty($st['documents_json']) ? json_decode($st['documents_json'], true) : [];
        if (!isset($st['address'])) {
            $st['address'] = $st['permanent_address'] ?? $st['current_address'] ?? '';
        }
    }
    unset($st);

    // Also fetch classes and sections for filtering
    $classStmt = $pdo->prepare("SELECT * FROM classes WHERE school_id = :school_id ORDER BY order_index ASC");
    $classStmt->execute([':school_id' => $schoolId]);
    $classes = $classStmt->fetchAll();

    jsonResponse(true, 'Students fetched successfully.', [
        'students' => $students,
        'classes'  => $classes,
        'total'    => count($students),
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Only Admin, Principal, Teacher, or Academic can create or update students
    requireAuth($pdo, ['superadmin', 'admin', 'principal', 'teacher', 'academic', 'admissions']);

    $input = getJsonInput();
    $action = $input['action'] ?? (!empty($input['id']) ? 'update' : 'create');

    $studentId   = !empty($input['id']) ? (int)$input['id'] : 0;
    $admissionNo = trim((string)($input['admission_no'] ?? 'ADM-' . date('Y') . '-' . rand(1000, 9999)));
    $firstName   = trim((string)($input['first_name'] ?? ''));
    $lastName    = trim((string)($input['last_name'] ?? ''));
    $classId     = !empty($input['class_id']) ? (int)$input['class_id'] : null;
    $sectionId   = !empty($input['section_id']) ? (int)$input['section_id'] : null;
    $rollNo      = !empty($input['roll_no']) ? (int)$input['roll_no'] : null;
    $gender      = $input['gender'] ?? 'other';
    $dobAd       = !empty($input['dob_ad']) ? $input['dob_ad'] : null;
    $dobBs       = !empty($input['dob_bs']) ? $input['dob_bs'] : null;
    $guardianName = trim((string)($input['guardian_name'] ?? ''));
    $guardianRelation = trim((string)($input['guardian_relation'] ?? 'Guardian'));
    $guardianPhone = trim((string)($input['guardian_phone'] ?? ''));
    $guardianEmail = trim((string)($input['guardian_email'] ?? ''));
    $address     = trim((string)($input['address'] ?? ''));
    $photoUrl    = trim((string)($input['photo_url'] ?? ''));
    $status      = in_array($input['status'] ?? '', ['active', 'inactive', 'transferred', 'graduated'], true) ? $input['status'] : 'active';
    $targetBranchId = !empty($input['branch_id']) ? (int)$input['branch_id'] : $branchId;

    if ($action === 'delete') {
        $delId = (int)($input['id'] ?? 0);
        if ($delId <= 0) {
            jsonResponse(false, 'Valid student ID is required for deletion.', null, 400);
        }
        try {
            $delStmt = $pdo->prepare("DELETE FROM students WHERE id = :id AND school_id = :school_id");
            $delStmt->execute([':id' => $delId, ':school_id' => $schoolId]);
            jsonResponse(true, "Student record deleted successfully.");
        } catch (PDOException $e) {
            jsonResponse(false, 'Failed to delete student: ' . $e->getMessage(), null, 500);
        }
    }

    if (empty($firstName) || empty($lastName)) {
        jsonResponse(false, 'Student first name and last name are required.', null, 400);
    }

    // Auto-resolve section_id if not explicitly provided
    if (!$sectionId && $classId) {
        $secStmt = $pdo->prepare("SELECT id FROM sections WHERE class_id = :cid ORDER BY id ASC LIMIT 1");
        $secStmt->execute([':cid' => $classId]);
        $sectionId = (int)$secStmt->fetchColumn() ?: null;
        if (!$sectionId) {
            $secCreate = $pdo->prepare("INSERT INTO sections (school_id, branch_id, class_id, name, room_no, capacity) VALUES (:s, :b, :c, 'Section A', 'Room 101', 40)");
            $secCreate->execute([':s' => $schoolId, ':b' => $targetBranchId, ':c' => $classId]);
            $sectionId = (int)$pdo->lastInsertId();
        }
    }

    if ($action === 'update' && $studentId > 0) {
        try {
            $update = $pdo->prepare("
                UPDATE students 
                SET class_id = :class_id,
                    section_id = :section_id,
                    roll_no = :roll_no,
                    first_name = :first_name,
                    last_name = :last_name,
                    gender = :gender,
                    dob_ad = :dob_ad,
                    dob_bs = :dob_bs,
                    guardian_name = :guardian_name,
                    guardian_relation = :guardian_relation,
                    guardian_phone = :guardian_phone,
                    guardian_email = :guardian_email,
                    permanent_address = :perm_address,
                    current_address = :curr_address,
                    photo_url = :photo_url,
                    status = :status
                WHERE id = :id AND school_id = :school_id
            ");

            $update->execute([
                ':class_id'         => $classId,
                ':section_id'       => $sectionId,
                ':roll_no'          => $rollNo,
                ':first_name'       => $firstName,
                ':last_name'        => $lastName,
                ':gender'           => ucfirst(strtolower($gender)),
                ':dob_ad'           => $dobAd,
                ':dob_bs'           => $dobBs,
                ':guardian_name'    => $guardianName,
                ':guardian_relation'=> $guardianRelation,
                ':guardian_phone'   => $guardianPhone,
                ':guardian_email'   => $guardianEmail,
                ':perm_address'     => $address,
                ':curr_address'     => $address,
                ':photo_url'        => $photoUrl,
                ':status'           => $status,
                ':id'               => $studentId,
                ':school_id'        => $schoolId,
            ]);

            // Audit Log
            logAuditAction(
                $pdo,
                $schoolId,
                $targetBranchId,
                (int)$user['id'],
                $user['name'],
                $user['role_slug'],
                'STUDENT_UPDATE',
                'students',
                (string)$studentId,
                null,
                ['name' => "$firstName $lastName", 'class_id' => $classId, 'status' => $status]
            );

            jsonResponse(true, "Student {$firstName} {$lastName} updated successfully.", [
                'student_id' => $studentId,
            ]);
        } catch (PDOException $e) {
            jsonResponse(false, 'Failed to update student: ' . $e->getMessage(), null, 500);
        }
    }

    // Resolve current academic year if not provided
    $academicYearId = !empty($input['academic_year_id']) ? (int)$input['academic_year_id'] : null;
    if (!$academicYearId) {
        $ayStmt = $pdo->prepare("SELECT id FROM academic_years WHERE school_id = :s AND is_current = 1 LIMIT 1");
        $ayStmt->execute([':s' => $schoolId]);
        $academicYearId = (int)$ayStmt->fetchColumn() ?: null;
    }

    try {
        $insert = $pdo->prepare("
            INSERT INTO students 
            (school_id, branch_id, academic_year_id, class_id, section_id, admission_no, roll_no, first_name, last_name, gender, dob_ad, dob_bs, guardian_name, guardian_relation, guardian_phone, guardian_email, permanent_address, current_address, photo_url, status)
            VALUES 
            (:school_id, :branch_id, :academic_year_id, :class_id, :section_id, :admission_no, :roll_no, :first_name, :last_name, :gender, :dob_ad, :dob_bs, :guardian_name, :guardian_relation, :guardian_phone, :guardian_email, :perm_address, :curr_address, :photo_url, 'active')
        ");

        $insert->execute([
            ':school_id'        => $schoolId,
            ':branch_id'        => $targetBranchId,
            ':academic_year_id' => $academicYearId,
            ':class_id'         => $classId,
            ':section_id'       => $sectionId,
            ':admission_no'     => $admissionNo,
            ':roll_no'          => $rollNo,
            ':first_name'       => $firstName,
            ':last_name'        => $lastName,
            ':gender'           => ucfirst(strtolower($gender)),
            ':dob_ad'           => $dobAd,
            ':dob_bs'           => $dobBs,
            ':guardian_name'    => $guardianName,
            ':guardian_relation'=> $guardianRelation,
            ':guardian_phone'   => $guardianPhone,
            ':guardian_email'   => $guardianEmail,
            ':perm_address'     => $address,
            ':curr_address'     => $address,
            ':photo_url'        => $photoUrl,
        ]);

        $studentId = (int)$pdo->lastInsertId();

        // Audit Log
        logAuditAction(
            $pdo,
            $schoolId,
            $targetBranchId,
            (int)$user['id'],
            $user['name'],
            $user['role_slug'],
            'STUDENT_CREATE',
            'students',
            (string)$studentId,
            null,
            ['admission_no' => $admissionNo, 'name' => "$firstName $lastName", 'class_id' => $classId]
        );

        jsonResponse(true, "Student {$firstName} {$lastName} registered successfully.", [
            'student_id'   => $studentId,
            'admission_no' => $admissionNo,
        ]);
    } catch (PDOException $e) {
        jsonResponse(false, 'Failed to register student: ' . $e->getMessage(), null, 500);
    }
}

jsonResponse(false, 'Method not allowed.', null, 405);

