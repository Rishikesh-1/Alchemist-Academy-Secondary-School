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
    $month = !empty($_GET['month']) ? (int)$_GET['month'] : null;
    $monthBs = !empty($_GET['month_bs']) ? trim((string)$_GET['month_bs']) : null;
    $yearBs  = !empty($_GET['year_bs']) ? trim((string)$_GET['year_bs']) : (!empty($_GET['year']) ? trim((string)$_GET['year']) : null);

    $nepaliMonths = [
        1 => 'Baisakh', 2 => 'Jestha', 3 => 'Ashadh', 4 => 'Shrawan',
        5 => 'Bhadra', 6 => 'Ashwin', 7 => 'Kartik', 8 => 'Mangsir',
        9 => 'Poush', 10 => 'Magh', 11 => 'Falgun', 12 => 'Chaitra'
    ];

    if ($month && isset($nepaliMonths[$month])) {
        $monthBs = $nepaliMonths[$month];
    }

    $sql = "
        SELECT ps.*, u.name as staff_name, u.email as staff_email, r.name as role_name
        FROM payroll_slips ps
        JOIN users u ON ps.user_id = u.id
        JOIN roles r ON u.role_id = r.id
        WHERE ps.school_id = :school_id
    ";
    $params = [':school_id' => $schoolId];

    if ($monthBs) {
        $sql .= " AND ps.month_bs = :m";
        $params[':m'] = $monthBs;
    }
    if ($yearBs) {
        $sql .= " AND ps.year_bs = :y";
        $params[':y'] = $yearBs;
    }
    $sql .= " ORDER BY u.name ASC";

    $slipsStmt = $pdo->prepare($sql);
    $slipsStmt->execute($params);
    $payslips = $slipsStmt->fetchAll();

    jsonResponse(true, 'Staff payroll data retrieved.', [
        'month'      => $monthBs ?: 'All',
        'year'       => $yearBs ?: 'All',
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
        $hra = (float)($input['house_rent_allowance'] ?? $input['allowances'] ?? 0);
        $da = (float)($input['dearness_allowance'] ?? 0);
        $med = (float)($input['medical_allowance'] ?? 0);
        $spec = (float)($input['special_allowance'] ?? 0);
        $pf = (float)($input['pf_deduction'] ?? $input['deductions'] ?? 0);
        $cit = (float)($input['cit_deduction'] ?? 0);
        $sst = (float)($input['social_security_tax'] ?? 0);

        if (!$staffUserId || $basicSalary <= 0) {
            jsonResponse(false, 'Valid staff user_id and basic_salary are required.', null, 400);
        }

        $ins = $pdo->prepare("
            INSERT INTO payroll_salary_structures 
            (school_id, user_id, basic_salary, house_rent_allowance, dearness_allowance, medical_allowance, special_allowance, pf_deduction, cit_deduction, social_security_tax)
            VALUES (:s, :uid, :b, :hra, :da, :med, :spec, :pf, :cit, :sst)
            ON DUPLICATE KEY UPDATE 
                basic_salary = VALUES(basic_salary),
                house_rent_allowance = VALUES(house_rent_allowance),
                dearness_allowance = VALUES(dearness_allowance),
                medical_allowance = VALUES(medical_allowance),
                special_allowance = VALUES(special_allowance),
                pf_deduction = VALUES(pf_deduction),
                cit_deduction = VALUES(cit_deduction),
                social_security_tax = VALUES(social_security_tax)
        ");
        $ins->execute([
            ':s'    => $schoolId,
            ':uid'  => $staffUserId,
            ':b'    => $basicSalary,
            ':hra'  => $hra,
            ':da'   => $da,
            ':med'  => $med,
            ':spec' => $spec,
            ':pf'   => $pf,
            ':cit'  => $cit,
            ':sst'  => $sst,
        ]);

        jsonResponse(true, 'Salary structure updated successfully.');
    }

    if ($action === 'generate_monthly_slips') {
        $monthInput = $input['month_bs'] ?? $input['month'] ?? date('n');
        $nepaliMonths = [
            1 => 'Baisakh', 2 => 'Jestha', 3 => 'Ashadh', 4 => 'Shrawan',
            5 => 'Bhadra', 6 => 'Ashwin', 7 => 'Kartik', 8 => 'Mangsir',
            9 => 'Poush', 10 => 'Magh', 11 => 'Falgun', 12 => 'Chaitra'
        ];
        if (is_numeric($monthInput) && isset($nepaliMonths[(int)$monthInput])) {
            $monthName = $nepaliMonths[(int)$monthInput];
        } else {
            $monthName = ucfirst((string)$monthInput);
        }

        $yearBs = (string)($input['year_bs'] ?? '2083');

        // Fetch all staff who have defined salary structures
        $structs = $pdo->prepare("SELECT * FROM payroll_salary_structures WHERE school_id = :s");
        $structs->execute([':s' => $schoolId]);
        $allStructures = $structs->fetchAll();

        $pdo->beginTransaction();
        $generatedCount = 0;

        try {
            $insSlip = $pdo->prepare("
                INSERT INTO payroll_slips 
                (school_id, branch_id, slip_no, user_id, month_bs, year_bs, basic_salary, total_allowances, gross_salary, total_deductions, net_salary, payment_method, status, paid_at)
                VALUES 
                (:s, :branch, :slip_no, :uid, :m, :y, :basic, :a, :gross, :d, :net, 'bank_transfer', 'paid', CURDATE())
                ON DUPLICATE KEY UPDATE 
                    basic_salary = VALUES(basic_salary),
                    total_allowances = VALUES(total_allowances),
                    gross_salary = VALUES(gross_salary),
                    total_deductions = VALUES(total_deductions),
                    net_salary = VALUES(net_salary),
                    status = VALUES(status)
            ");

            foreach ($allStructures as $st) {
                $basic = (float)$st['basic_salary'];
                $allow = (float)($st['house_rent_allowance'] ?? 0) + (float)($st['dearness_allowance'] ?? 0) + (float)($st['medical_allowance'] ?? 0) + (float)($st['special_allowance'] ?? 0);
                $gross = $basic + $allow;
                $deduct = (float)($st['pf_deduction'] ?? 0) + (float)($st['cit_deduction'] ?? 0) + (float)($st['social_security_tax'] ?? 0);
                $net = $gross - $deduct;
                $slipNo = 'PAY-' . $yearBs . '-' . strtoupper(substr($monthName, 0, 3)) . '-' . str_pad((string)$st['user_id'], 3, '0', STR_PAD_LEFT);

                $insSlip->execute([
                    ':s'       => $schoolId,
                    ':branch'  => $branchId,
                    ':slip_no' => $slipNo,
                    ':uid'     => (int)$st['user_id'],
                    ':m'       => $monthName,
                    ':y'       => $yearBs,
                    ':basic'   => $basic,
                    ':a'       => $allow,
                    ':gross'   => $gross,
                    ':d'       => $deduct,
                    ':net'     => $net,
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
                "{$yearBs}-{$monthName}",
                null,
                ['month' => $monthName, 'year' => $yearBs, 'slips_count' => $generatedCount]
            );

            jsonResponse(true, "Generated {$generatedCount} payslips for month {$monthName} {$yearBs}.", [
                'slips_count' => $generatedCount,
                'month'       => $monthName,
                'year'        => $yearBs,
            ]);

        } catch (Exception $e) {
            $pdo->rollBack();
            jsonResponse(false, 'Payroll generation failed: ' . $e->getMessage(), null, 500);
        }
    }
}

jsonResponse(false, 'Method not allowed.', null, 405);

