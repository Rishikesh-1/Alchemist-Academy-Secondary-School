<?php
// api/fees/structures.php
// Fee structures, billing tariffs, installments, and fee categories
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth_guard.php';

$user = requireAuth($pdo);
$schoolId = (int)$user['school_id'];
$branchId = !empty($_GET['branch_id']) ? (int)$_GET['branch_id'] : ($user['branch_id'] ? (int)$user['branch_id'] : null);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // 1. Fee Categories
    $catStmt = $pdo->prepare("SELECT * FROM fee_categories WHERE school_id = :school_id ORDER BY id ASC");
    $catStmt->execute([':school_id' => $schoolId]);
    $categories = $catStmt->fetchAll();

    // 2. Fee Structures with Class names
    $sql = "
        SELECT fs.*, c.name as class_name, fc.name as category_name
        FROM fee_structures fs
        LEFT JOIN classes c ON fs.class_id = c.id
        LEFT JOIN fee_categories fc ON fs.fee_category_id = fc.id
        WHERE fs.school_id = :school_id
    ";
    $params = [':school_id' => $schoolId];
    if ($branchId) {
        $sql .= " AND (fs.branch_id = :branch_id OR fs.branch_id IS NULL)";
        $params[':branch_id'] = $branchId;
    }
    $sql .= " ORDER BY c.display_order ASC, fs.fee_category_id ASC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $structures = $stmt->fetchAll();

    jsonResponse(true, 'Fee structures retrieved.', [
        'categories' => $categories,
        'structures' => $structures,
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAuth($pdo, ['superadmin', 'admin', 'principal', 'accountant']);

    $input = getJsonInput();
    $classId = !empty($input['class_id']) ? (int)$input['class_id'] : null;
    $categoryId = !empty($input['fee_category_id']) ? (int)$input['fee_category_id'] : null;
    $amount = (float)($input['amount'] ?? 0);
    $billingFrequency = trim((string)($input['billing_frequency'] ?? 'monthly'));
    $installments = (int)($input['installments_count'] ?? 1);
    $dueDateDay = (int)($input['due_date_day'] ?? 10);
    $lateFeePenalty = (float)($input['late_fee_penalty'] ?? 0);

    if (!$classId || !$categoryId || $amount <= 0) {
        jsonResponse(false, 'Class, fee category, and valid amount (> 0) are required.', null, 400);
    }

    $insert = $pdo->prepare("
        INSERT INTO fee_structures 
        (school_id, branch_id, class_id, fee_category_id, amount, billing_frequency, installments_count, due_date_day, late_fee_penalty)
        VALUES 
        (:school_id, :branch_id, :class_id, :cat_id, :amount, :freq, :installments, :due_day, :late_fee)
    ");

    $insert->execute([
        ':school_id'    => $schoolId,
        ':branch_id'    => $branchId,
        ':class_id'     => $classId,
        ':cat_id'       => $categoryId,
        ':amount'       => $amount,
        ':freq'         => $billingFrequency,
        ':installments' => $installments,
        ':due_day'      => $dueDateDay,
        ':late_fee'     => $lateFeePenalty,
    ]);

    $newId = (int)$pdo->lastInsertId();

    logAuditAction(
        $pdo,
        $schoolId,
        $branchId,
        (int)$user['id'],
        $user['name'],
        $user['role_slug'],
        'FEE_STRUCTURE_CREATE',
        'fee_structures',
        (string)$newId,
        null,
        ['class_id' => $classId, 'amount' => $amount, 'frequency' => $billingFrequency]
    );

    jsonResponse(true, 'Fee tariff structure created successfully.', ['id' => $newId]);
}

jsonResponse(false, 'Method not allowed.', null, 405);

