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
        SELECT id, name, code, address, contact_phone as phone, contact_email as email, is_main as is_main_branch, is_main, status, created_at 
        FROM branches 
        WHERE school_id = :school_id 
        ORDER BY is_main DESC, name ASC
    ");
    $branchStmt->execute([':school_id' => $schoolId]);
    $branches = $branchStmt->fetchAll();

    // Fetch Academic Years
    try {
        $yearStmt = $pdo->prepare("
            SELECT id, year_bs, year_ad, is_current, start_date_ad, end_date_ad 
            FROM academic_years 
            WHERE school_id = :school_id 
            ORDER BY is_current DESC, id DESC
        ");
        $yearStmt->execute([':school_id' => $schoolId]);
        $academicYears = $yearStmt->fetchAll();
    } catch (PDOException $e) {
        $academicYears = [];
    }

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

