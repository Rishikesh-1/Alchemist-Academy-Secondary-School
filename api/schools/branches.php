<?php
// api/schools/branches.php
// Multi-tenant branches and school context endpoint
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth_guard.php';

$user = requireAuth($pdo);
$schoolId = (int)$user['school_id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Fetch School Info
    $schoolStmt = $pdo->prepare("SELECT * FROM schools WHERE id = :school_id LIMIT 1");
    $schoolStmt->execute([':school_id' => $schoolId]);
    $school = $schoolStmt->fetch();

    // Fetch Branches
    $branchStmt = $pdo->prepare("
        SELECT id, name, code, address, phone, email, is_main_branch, status, created_at 
        FROM branches 
        WHERE school_id = :school_id 
        ORDER BY is_main_branch DESC, name ASC
    ");
    $branchStmt->execute([':school_id' => $schoolId]);
    $branches = $branchStmt->fetchAll();

    // Fetch Academic Years
    $yearStmt = $pdo->prepare("
        SELECT id, name, bs_year, is_current, start_date, end_date 
        FROM academic_years 
        WHERE school_id = :school_id 
        ORDER BY is_current DESC, name DESC
    ");
    $yearStmt->execute([':school_id' => $schoolId]);
    $academicYears = $yearStmt->fetchAll();

    jsonResponse(true, 'School branches fetched successfully.', [
        'school'        => $school,
        'branches'      => $branches,
        'academicYears' => $academicYears,
        'currentBranch' => [
            'id'   => $user['branch_id'] ? (int)$user['branch_id'] : ($branches[0]['id'] ?? 1),
            'name' => $user['branch_name'] ?? ($branches[0]['name'] ?? 'Main Campus'),
            'code' => $user['branch_code'] ?? ($branches[0]['code'] ?? 'BR-MAIN'),
        ],
    ]);
}

jsonResponse(false, 'Method not allowed.', null, 405);
