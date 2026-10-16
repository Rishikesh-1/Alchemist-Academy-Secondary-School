<?php
// api/fees/collect.php
// Counter cashier fee collection, receipt generation, and transaction ledger
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth_guard.php';

$user = requireAuth($pdo);
$schoolId = (int)$user['school_id'];
$branchId = !empty($_GET['branch_id']) ? (int)$_GET['branch_id'] : ($user['branch_id'] ? (int)$user['branch_id'] : 1);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // List fee receipts / audit ledger
    $studentId = !empty($_GET['student_id']) ? (int)$_GET['student_id'] : null;
    $date = !empty($_GET['date']) ? trim((string)$_GET['date']) : null;

    $sql = "
        SELECT 
            fr.*,
            s.first_name,
            s.last_name,
            s.admission_no,
            s.guardian_name,
            c.name as class_name,
            fr.cashier_name
        FROM fee_receipts fr
        JOIN students s ON fr.student_id = s.id
        LEFT JOIN classes c ON s.class_id = c.id
        WHERE fr.school_id = :school_id
    ";
    $params = [':school_id' => $schoolId];

    if ($branchId) {
        $sql .= " AND (fr.branch_id = :branch_id OR fr.branch_id IS NULL)";
        $params[':branch_id'] = $branchId;
    }

    if ($studentId) {
        $sql .= " AND fr.student_id = :student_id";
        $params[':student_id'] = $studentId;
    }

    if ($date) {
        $sql .= " AND fr.payment_date_ad = :p_date";
        $params[':p_date'] = $date;
    }

    $sql .= " ORDER BY fr.id DESC LIMIT 100";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $receipts = $stmt->fetchAll();

    jsonResponse(true, 'Fee receipts ledger retrieved.', [
        'receipts' => $receipts,
        'count'    => count($receipts),
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAuth($pdo, ['superadmin', 'admin', 'principal', 'accountant', 'admissions']);

    $input = getJsonInput();
    $studentId = !empty($input['student_id']) ? (int)$input['student_id'] : null;
    $invoiceId = !empty($input['invoice_id']) ? (int)$input['invoice_id'] : null;
    $amount = (float)($input['amount'] ?? $input['amount_paid'] ?? 0);
    $rawMode = strtolower(trim((string)($input['payment_mode'] ?? $input['payment_method'] ?? 'cash')));
    $validMethods = ['cash', 'esewa', 'khalti', 'fonepay', 'bank_transfer', 'cheque'];
    if (!in_array($rawMode, $validMethods, true)) {
        if ($rawMode === 'qr') {
            $paymentMethod = 'fonepay';
        } else {
            $paymentMethod = 'cash';
        }
    } else {
        $paymentMethod = $rawMode;
    }
    $paymentMode = $paymentMethod;
    $transactionRef = trim((string)($input['transaction_reference'] ?? $input['transaction_ref'] ?? ''));
    $remarks = trim((string)($input['remarks'] ?? $input['notes'] ?? 'Tuition & Academic Term Fee'));
    $dateAd = trim((string)($input['payment_date_ad'] ?? $input['date'] ?? date('Y-m-d')));
    $dateBs = trim((string)($input['payment_date_bs'] ?? '2083-06-30'));

    if (!$studentId || $amount <= 0) {
        jsonResponse(false, 'Valid student_id and amount (> 0) are required.', null, 400);
    }

    $stStmt = $pdo->prepare("SELECT id, first_name, last_name, admission_no, class_id FROM students WHERE id = :id AND school_id = :s LIMIT 1");
    $stStmt->execute([':id' => $studentId, ':s' => $schoolId]);
    $student = $stStmt->fetch();

    if (!$student) {
        jsonResponse(false, 'Student not found.', null, 404);
    }

    $receiptNo = 'REC-' . date('Y') . '-' . strtoupper(substr(uniqid(), -6));

    $pdo->beginTransaction();

    try {
        $insert = $pdo->prepare("
            INSERT INTO fee_receipts 
            (school_id, branch_id, student_id, invoice_id, receipt_no, amount_paid, payment_method, transaction_ref, payment_date_ad, payment_date_bs, cashier_id, cashier_name, notes, status)
            VALUES 
            (:school_id, :branch_id, :student_id, :invoice_id, :receipt_no, :amount, :method, :ref, :date_ad, :date_bs, :cashier_id, :cashier_name, :notes, 'cleared')
        ");

        $insert->execute([
            ':school_id'     => $schoolId,
            ':branch_id'     => $branchId,
            ':student_id'    => $studentId,
            ':invoice_id'    => $invoiceId,
            ':receipt_no'    => $receiptNo,
            ':amount'        => $amount,
            ':method'        => $paymentMethod,
            ':ref'           => $transactionRef ?: null,
            ':date_ad'       => $dateAd,
            ':date_bs'       => $dateBs,
            ':cashier_id'    => (int)$user['id'],
            ':cashier_name'  => $user['name'] ?? 'Counter Cashier',
            ':notes'         => $remarks,
        ]);

        $receiptId = (int)$pdo->lastInsertId();

        // If linked to an invoice, update paid_amount and status
        if ($invoiceId) {
            $updInv = $pdo->prepare("
                UPDATE fee_invoices 
                SET paid_amount = paid_amount + :amt,
                    status = CASE 
                        WHEN (paid_amount + :amt2) >= net_payable THEN 'paid' 
                        ELSE 'partial' 
                    END,
                    updated_at = NOW()
                WHERE id = :inv_id AND school_id = :school_id
            ");
            $updInv->execute([
                ':amt'       => $amount,
                ':amt2'      => $amount,
                ':inv_id'    => $invoiceId,
                ':school_id' => $schoolId,
            ]);
        }

        $pdo->commit();

        logAuditAction(
            $pdo,
            $schoolId,
            $branchId,
            (int)$user['id'],
            $user['name'],
            $user['role_slug'],
            'FEE_RECEIPT_COLLECT',
            'fee_receipts',
            $receiptNo,
            null,
            ['student_id' => $studentId, 'receipt_no' => $receiptNo, 'amount' => $amount, 'mode' => $paymentMode]
        );

        jsonResponse(true, "Fee payment of NPR " . number_format($amount, 2) . " received. Receipt {$receiptNo} generated.", [
            'receipt_id'   => $receiptId,
            'receipt_no'   => $receiptNo,
            'student_name' => "{$student['first_name']} {$student['last_name']}",
            'amount_paid'  => $amount,
            'payment_mode' => $paymentMode,
            'date'         => date('Y-m-d H:i:s'),
        ]);

    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        jsonResponse(false, 'Payment collection failed: ' . $e->getMessage(), null, 500);
    }
}

jsonResponse(false, 'Method not allowed.', null, 405);

