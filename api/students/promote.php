<?php
// api/students/promote.php
// Academic student promotion engine with audit trails and promotion history tracking
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth_guard.php';

$user = requireAuth($pdo, ['superadmin', 'admin', 'principal', 'academic']);
$schoolId = (int)$user['school_id'];
$branchId = !empty($_GET['branch_id']) ? (int)$_GET['branch_id'] : ($user['branch_id'] ? (int)$user['branch_id'] : null);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method not allowed. Use POST.', null, 405);
}

$input = getJsonInput();
$studentIds = $input['student_ids'] ?? [];
$toClassId  = !empty($input['to_class_id']) ? (int)$input['to_class_id'] : null;
$toSectionId = !empty($input['to_section_id']) ? (int)$input['to_section_id'] : null;
$toYearId   = !empty($input['to_academic_year_id']) ? (int)$input['to_academic_year_id'] : null;
$remarks    = trim((string)($input['remarks'] ?? 'Academic promotion'));

if (!is_array($studentIds) || empty($studentIds) || !$toClassId) {
    jsonResponse(false, 'Please provide student_ids array and destination to_class_id.', null, 400);
}

// Fallback to active year if toYearId not specified
if (!$toYearId) {
    $ayStmt = $pdo->prepare("SELECT id FROM academic_years WHERE school_id = :s AND is_current = 1 LIMIT 1");
    $ayStmt->execute([':s' => $schoolId]);
    $toYearId = (int)$ayStmt->fetchColumn() ?: null;
}

$promotedCount = 0;
$pdo->beginTransaction();

try {
    $studentStmt = $pdo->prepare("
        SELECT id, class_id, academic_year_id, first_name, last_name, admission_no 
        FROM students 
        WHERE id = :id AND school_id = :school_id
    ");

    $promoHistoryStmt = $pdo->prepare("
        INSERT INTO student_promotions 
        (school_id, student_id, from_academic_year_id, to_academic_year_id, from_class_id, to_class_id, promotion_date, status, remarks, promoted_by_user_id)
        VALUES 
        (:school_id, :student_id, :from_year, :to_year, :from_class, :to_class, CURDATE(), 'promoted', :remarks, :promoted_by)
    ");

    $updateStudentStmt = $pdo->prepare("
        UPDATE students 
        SET class_id = :to_class, section_id = :to_section, academic_year_id = :to_year, updated_at = NOW() 
        WHERE id = :student_id
    ");

    foreach ($studentIds as $id) {
        $studentStmt->execute([':id' => (int)$id, ':school_id' => $schoolId]);
        $st = $studentStmt->fetch();
        if (!$st) continue;

        $promoHistoryStmt->execute([
            ':school_id'   => $schoolId,
            ':student_id'  => (int)$st['id'],
            ':from_year'   => $st['academic_year_id'],
            ':to_year'     => $toYearId,
            ':from_class'  => $st['class_id'],
            ':to_class'    => $toClassId,
            ':remarks'     => $remarks,
            ':promoted_by' => (int)$user['id'],
        ]);

        $updateStudentStmt->execute([
            ':to_class'    => $toClassId,
            ':to_section'  => $toSectionId,
            ':to_year'     => $toYearId,
            ':student_id'  => (int)$st['id'],
        ]);

        $promotedCount++;
    }

    $pdo->commit();

    logAuditAction(
        $pdo,
        $schoolId,
        $branchId,
        (int)$user['id'],
        $user['name'],
        $user['role_slug'],
        'STUDENT_PROMOTION',
        'student_promotions',
        (string)$toClassId,
        null,
        ['promoted_count' => $promotedCount, 'destination_class_id' => $toClassId]
    );

    jsonResponse(true, "Successfully promoted {$promotedCount} students.", [
        'promoted_count' => $promotedCount,
        'to_class_id'    => $toClassId,
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    jsonResponse(false, 'Promotion failed: ' . $e->getMessage(), null, 500);
}

