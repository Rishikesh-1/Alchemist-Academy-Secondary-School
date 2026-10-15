<?php
// api/auth/me.php
// Returns authenticated user profile, roles, and branch details
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth_guard.php';

$user = requireAuth($pdo);

jsonResponse(true, 'User authenticated.', [
    'user' => [
        'id'         => (int)$user['id'],
        'schoolId'   => (int)$user['school_id'],
        'branchId'   => $user['branch_id'] ? (int)$user['branch_id'] : null,
        'branchName' => $user['branch_name'] ?? 'Main Campus',
        'branchCode' => $user['branch_code'] ?? 'BR-MAIN',
        'username'   => $user['username'],
        'name'       => $user['name'],
        'email'      => $user['email'],
        'role'       => $user['role_slug'],
        'roleName'   => $user['role_name'],
        'department' => $user['department'],
    ],
]);

