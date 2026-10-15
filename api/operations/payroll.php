<?php
// api/operations/payroll.php
// Staff salary structures, deduction calculations, and monthly payslip generation
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth_guard.php';

$user = requireAuth($pdo);
$schoolId = (int)$user['school_id'];
$branchId = !empty($_GET['branch_id']) ? (int)$_GET['branch_id'] : ($user['branch_id'] ? (int)$user['branch_id'] : 1);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // 1. Staff Salary Structures
    $structStmt = $pdo->prepare("
        SELECT pss.*, u.name as staff_name, u.email as staff_email, r.name as role_name 
        FROM payroll_salary_structures pss
        JOIN users u ON pss.user_id = u.id
        JOIN roles r ON u.role_id = r.id
        WHERE pss.school_id = :school_id
        ORDER BY u.name ASC
    ");
    $structStmt->execute([':school_id' => $schoolId]);
    $structures = $structStmt->fetchAll();

    // 2. Payslips
    $month = !empty($_GET['month']) ? (int)$_GET['month'] : (int)date('n');
    $year  = !empty($_GET['year']) ? (int)$_GET['year'] : (int)date('Y');

    $slipsStmt = $pdo->prepare("
        SELECT ps.*, u.name as staff_name, u.email as staff_email, r.name as role_name
        FROM payroll_slips ps
        JOIN users u ON ps.user_id = u.id
        JOIN roles r ON u.role_id = r.id
        WHERE ps.school_id = :school_id AND ps.month = :m AND ps.year = :y
        ORDER BY u.name ASC
    ");
    $slipsStmt->execute([
        ':school_id' => $schoolId,
        ':m'         => $month,
        ':y'         => $year,
    ]);
    $payslips = $slipsStmt->fetchAll();

    jsonResponse(true, 'Staff payroll data retrieved.', [
        'month'      => $month,
        'year'       => $year,
        'structures' => $structures,
        'payslips'   => $payslips,
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAuth($pdo, ['superadmin', 'admin', 'principal', 'accountant']);

    $input = getJsonInput();
    $action = $input['action'] ?? 'generate_monthly_slips';

    if ($action === 'set_structure') {
        $staffUserId = (int)($input['user_id'] ?? 0);
        $basicSalary = (float)($input['basic_salary'] ?? 0);
        $allowances  = (float)($input['allowances'] ?? 0);
        $deductions  = (float)($input['deductions'] ?? 0);

        if (!$staffUserId || $basicSalary <= 0) {
            jsonResponse(false, 'Valid staff user_id and basic_salary are required.', null, 400);
        }

        $ins = $pdo->prepare("
            INSERT INTO payroll_salary_structures 
            (school_id, user_id, basic_salary, allowances, deductions, effective_from)
            VALUES (:s, :uid, :b, :a, :d, CURDATE())
            ON DUPLICATE KEY UPDATE 
                basic_salary = VALUES(basic_salary),
                allowances = VALUES(allowances),
                deductions = VALUES(deductions)
        ");
        $ins->execute([
            ':s'   => $schoolId,
            ':uid' => $staffUserId,
            ':b'   => $basicSalary,
            ':a'   => $allowances,
            ':d'   => $deductions,
        ]);

        jsonResponse(true, 'Salary structure updated successfully.');
    }

    if ($action === 'generate_monthly_slips') {
        $month = (int)($input['month'] ?? date('n'));
        $year  = (int)($input['year'] ?? date('Y'));

        // Fetch all staff who have defined salary structures
        $structs = $pdo->prepare("SELECT * FROM payroll_salary_structures WHERE school_id = :s");
        $structs->execute([':s' => $schoolId]);
        $allStructures = $structs->fetchAll();

        $pdo->beginTransaction();
        $generatedCount = 0;

        try {
            $insSlip = $pdo->prepare("
                INSERT INTO payroll_slips 
                (school_id, user_id, month, year, basic_salary, allowances, deductions, net_salary, payment_status, generated_by_user_id)
                VALUES 
                (:s, :uid, :m, :y, :b, :a, :d, :net, 'paid', :gen_by)
                ON DUPLICATE KEY UPDATE 
                    basic_salary = VALUES(basic_salary),
                    allowances = VALUES(allowances),
                    deductions = VALUES(deductions),
                    net_salary = VALUES(net_salary),
                    payment_status = VALUES(payment_status)
            ");

            foreach ($allStructures as $st) {
                $basic = (float)$st['basic_salary'];
                $allow = (float)$st['allowances'];
                $deduct = (float)$st['deductions'];
                $net = $basic + $allow - $deduct;

                $insSlip->execute([
                    ':s'      => $schoolId,
                    ':uid'    => (int)$st['user_id'],
                    ':m'      => $month,
                    ':y'      => $year,
                    ':b'      => $basic,
                    ':a'      => $allow,
                    ':d'      => $deduct,
                    ':net'    => $net,
                    ':gen_by' => (int)$user['id'],
                ]);
                $generatedCount++;
            }

            $pdo->commit();

            logAuditAction(
                $pdo,
                $schoolId,
                $branchId,
                (int)$user['id'],
                $user['name'],
                $user['role_slug'],
                'PAYROLL_GENERATE_SLIPS',
                'payroll_slips',
                "{$year}-{$month}",
                null,
                ['month' => $month, 'year' => $year, 'slips_count' => $generatedCount]
            );

            jsonResponse(true, "Generated {$generatedCount} payslips for month {$month}/{$year}.", [
                'slips_count' => $generatedCount,
                'month'       => $month,
                'year'        => $year,
            ]);

        } catch (Exception $e) {
            $pdo->rollBack();
            jsonResponse(false, 'Payroll generation failed: ' . $e->getMessage(), null, 500);
        }
    }
}

jsonResponse(false, 'Method not allowed.', null, 405);
