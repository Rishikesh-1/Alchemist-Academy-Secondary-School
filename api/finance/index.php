<?php
// api/finance/index.php
// Financial accounting: Income (Fee Receipts) & Expense tracking, cashflow and profit/loss
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth_guard.php';

$user = requireAuth($pdo);
$schoolId = (int)$user['school_id'];
$branchId = !empty($_GET['branch_id']) ? (int)$_GET['branch_id'] : ($user['branch_id'] ? (int)$user['branch_id'] : 1);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // 1. Total Income from Fee Receipts
    $incStmt = $pdo->prepare("
        SELECT COALESCE(SUM(amount_paid), 0) FROM fee_receipts WHERE school_id = :school_id
    ");
    $incStmt->execute([':school_id' => $schoolId]);
    $totalIncome = (float)$incStmt->fetchColumn();

    // 2. Total Expenses
    $expStmt = $pdo->prepare("
        SELECT COALESCE(SUM(amount), 0) FROM financial_expenses WHERE school_id = :school_id
    ");
    $expStmt->execute([':school_id' => $schoolId]);
    $totalExpense = (float)$expStmt->fetchColumn();

    // 3. Recent Expenses
    $recentExp = $pdo->prepare("
        SELECT fe.*, u.name as created_by_name 
        FROM financial_expenses fe
        LEFT JOIN users u ON fe.created_by_user_id = u.id
        WHERE fe.school_id = :school_id
        ORDER BY fe.expense_date DESC, fe.id DESC LIMIT 50
    ");
    $recentExp->execute([':school_id' => $schoolId]);
    $expensesList = $recentExp->fetchAll();

    // 4. Breakdown by Category
    $catStmt = $pdo->prepare("
        SELECT category, SUM(amount) as total_amount, COUNT(*) as entries_count
        FROM financial_expenses
        WHERE school_id = :school_id
        GROUP BY category
    ");
    $catStmt->execute([':school_id' => $schoolId]);
    $categoryBreakdown = $catStmt->fetchAll();

    jsonResponse(true, 'Financial metrics and expense ledger retrieved.', [
        'summary' => [
            'total_income'  => $totalIncome,
            'total_expense' => $totalExpense,
            'net_balance'   => $totalIncome - $totalExpense,
        ],
        'expenses'   => $expensesList,
        'categories' => $categoryBreakdown,
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAuth($pdo, ['superadmin', 'admin', 'principal', 'accountant']);

    $input = getJsonInput();
    $title       = trim((string)($input['title'] ?? ''));
    $category    = trim((string)($input['category'] ?? 'utilities'));
    $amount      = (float)($input['amount'] ?? 0);
    $paymentMode = trim((string)($input['payment_mode'] ?? 'cash'));
    $refNo       = trim((string)($input['reference_no'] ?? 'VCH-' . rand(1000, 9999)));
    $expenseDate = trim((string)($input['expense_date'] ?? date('Y-m-d')));
    $notes       = trim((string)($input['notes'] ?? ''));

    if (empty($title) || $amount <= 0) {
        jsonResponse(false, 'Valid expense title and amount (> 0) are required.', null, 400);
    }

    $stmt = $pdo->prepare("
        INSERT INTO financial_expenses 
        (school_id, branch_id, title, category, amount, payment_mode, reference_no, expense_date, notes, created_by_user_id)
        VALUES (:s, :b, :title, :cat, :amt, :mode, :ref, :edate, :notes, :uid)
    ");
    $stmt->execute([
        ':s'     => $schoolId,
        ':b'     => $branchId,
        ':title' => $title,
        ':cat'   => $category,
        ':amt'   => $amount,
        ':mode'  => $paymentMode,
        ':ref'   => $refNo,
        ':edate' => $expenseDate,
        ':notes' => $notes,
        ':uid'   => (int)$user['id'],
    ]);

    $newId = (int)$pdo->lastInsertId();

    logAuditAction(
        $pdo,
        $schoolId,
        $branchId,
        (int)$user['id'],
        $user['name'],
        $user['role_slug'],
        'EXPENSE_VOUCHER_CREATE',
        'financial_expenses',
        $refNo,
        null,
        ['title' => $title, 'amount' => $amount, 'category' => $category]
    );

    jsonResponse(true, "Expense voucher '{$title}' for NPR " . number_format($amount, 2) . " saved.", [
        'id'           => $newId,
        'reference_no' => $refNo,
    ]);
}

jsonResponse(false, 'Method not allowed.', null, 405);

