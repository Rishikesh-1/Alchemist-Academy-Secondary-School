<?php
// api/students/transfer_certificate.php
// Official Transfer Certificate (TC) generator and verification system with audit trails
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth_guard.php';

$user = requireAuth($pdo);
$schoolId = (int)$user['school_id'];
$branchId = !empty($_GET['branch_id']) ? (int)$_GET['branch_id'] : ($user['branch_id'] ? (int)$user['branch_id'] : null);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // List TCs or get single TC
    $studentId = !empty($_GET['student_id']) ? (int)$_GET['student_id'] : null;
    $tcNumber  = trim((string)($_GET['tc_number'] ?? ''));

    if ($tcNumber) {
        $stmt = $pdo->prepare("
            SELECT tc.*, s.first_name, s.last_name, s.admission_no, s.guardian_name, s.guardian_phone,
                   c.name as class_name, sch.name as school_name, sch.address as school_address, sch.phone as school_phone
            FROM transfer_certificates tc
            JOIN students s ON tc.student_id = s.id
            JOIN schools sch ON tc.school_id = sch.id
            LEFT JOIN classes c ON s.class_id = c.id
            WHERE tc.tc_number = :tc_num AND tc.school_id = :school_id
            LIMIT 1
        ");
        $stmt->execute([':tc_num' => $tcNumber, ':school_id' => $schoolId]);
        $tc = $stmt->fetch();
        if (!$tc) {
            jsonResponse(false, 'Transfer Certificate not found.', null, 404);
        }
        jsonResponse(true, 'Transfer Certificate retrieved.', ['tc' => $tc]);
    }

    $sql = "
        SELECT tc.*, s.first_name, s.last_name, s.admission_no, c.name as class_name, u.name as issued_by_name
        FROM transfer_certificates tc
        JOIN students s ON tc.student_id = s.id
        LEFT JOIN classes c ON s.class_id = c.id
        LEFT JOIN users u ON tc.issued_by_user_id = u.id
        WHERE tc.school_id = :school_id
    ";
    $params = [':school_id' => $schoolId];

    if ($studentId) {
        $sql .= " AND tc.student_id = :student_id";
        $params[':student_id'] = $studentId;
    }

    $sql .= " ORDER BY tc.id DESC LIMIT 50";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $tcs = $stmt->fetchAll();

    jsonResponse(true, 'Transfer Certificates retrieved.', ['certificates' => $tcs]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAuth($pdo, ['superadmin', 'admin', 'principal']);

    $input = getJsonInput();
    $studentId = !empty($input['student_id']) ? (int)$input['student_id'] : null;
    $reasonForLeaving = trim((string)($input['reason_for_leaving'] ?? 'Parent relocation / higher studies'));
    $conduct = trim((string)($input['conduct'] ?? 'Good'));
    $remarks = trim((string)($input['remarks'] ?? 'Cleared all institutional dues. Character certificate issued.'));

    if (!$studentId) {
        jsonResponse(false, 'student_id is required.', null, 400);
    }

    $stStmt = $pdo->prepare("SELECT * FROM students WHERE id = :id AND school_id = :school_id LIMIT 1");
    $stStmt->execute([':id' => $studentId, ':school_id' => $schoolId]);
    $student = $stStmt->fetch();

    if (!$student) {
        jsonResponse(false, 'Student not found.', null, 404);
    }

    $tcNumber = 'TC-' . date('Y') . '-' . str_pad((string)$studentId, 5, '0', STR_PAD_LEFT);
    $verificationToken = bin2hex(random_bytes(16));

    $pdo->beginTransaction();

    try {
        $insert = $pdo->prepare("
            INSERT INTO transfer_certificates 
            (school_id, student_id, tc_number, issue_date, reason_for_leaving, conduct, remarks, verification_token, issued_by_user_id)
            VALUES 
            (:school_id, :student_id, :tc_number, CURDATE(), :reason, :conduct, :remarks, :v_token, :issued_by)
            ON DUPLICATE KEY UPDATE 
                reason_for_leaving = VALUES(reason_for_leaving),
                conduct = VALUES(conduct),
                remarks = VALUES(remarks)
        ");

        $insert->execute([
            ':school_id'  => $schoolId,
            ':student_id' => $studentId,
            ':tc_number'  => $tcNumber,
            ':reason'     => $reasonForLeaving,
            ':conduct'    => $conduct,
            ':remarks'    => $remarks,
            ':v_token'    => $verificationToken,
            ':issued_by'  => (int)$user['id'],
        ]);

        // Update student status to transferred
        $updateSt = $pdo->prepare("UPDATE students SET status = 'transferred', updated_at = NOW() WHERE id = :id");
        $updateSt->execute([':id' => $studentId]);

        $pdo->commit();

        logAuditAction(
            $pdo,
            $schoolId,
            $branchId,
            (int)$user['id'],
            $user['name'],
            $user['role_slug'],
            'STUDENT_TC_ISSUED',
            'transfer_certificates',
            $tcNumber,
            ['previous_status' => $student['status']],
            ['new_status' => 'transferred', 'tc_number' => $tcNumber]
        );

        jsonResponse(true, "Transfer Certificate {$tcNumber} issued successfully.", [
            'tc_number'          => $tcNumber,
            'verification_token' => $verificationToken,
            'student_name'       => "{$student['first_name']} {$student['last_name']}",
            'issue_date'         => date('Y-m-d'),
        ]);

    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        jsonResponse(false, 'Failed to issue TC: ' . $e->getMessage(), null, 500);
    }
}

jsonResponse(false, 'Method not allowed.', null, 405);

