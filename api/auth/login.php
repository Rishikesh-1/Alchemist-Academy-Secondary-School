<?php
// api/auth/login.php
// Enterprise multi-tenant authentication with Bcrypt hash validation and server-side rate limiting
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method not allowed. Use POST.', null, 405);
}

$input = getJsonInput();
$username = trim((string)($input['username'] ?? ''));
$password = (string)($input['password'] ?? '');
$schoolId = resolveSchoolId($pdo);
$clientIp = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

if (empty($username) || empty($password)) {
    jsonResponse(false, 'Username and password are required.', null, 400);
}

// -------------------------------------------------------------
// 1. Server-Side Rate Limiter (Max 5 failed attempts per 15 mins)
// -------------------------------------------------------------
$rateWindowSeconds = 900; // 15 minutes
$maxFailedAttempts = 5;
$windowStart = time() - $rateWindowSeconds;

// Clean up old attempts
$pdo->prepare("DELETE FROM login_attempts WHERE attempt_time < :cut_off")
    ->execute([':cut_off' => $windowStart]);

// Count failed attempts for this IP or this Username
$rateCheck = $pdo->prepare("
    SELECT COUNT(*) FROM login_attempts 
    WHERE (ip_address = :ip OR username = :username) 
      AND is_success = 0 
      AND attempt_time >= :window_start
");
$rateCheck->execute([
    ':ip'           => $clientIp,
    ':username'     => $username,
    ':window_start' => $windowStart,
]);
$failedCount = (int)$rateCheck->fetchColumn();

if ($failedCount >= $maxFailedAttempts) {
    // Record throttled event
    jsonResponse(false, 'Too many failed login attempts. Security lock engaged. Please wait 15 minutes before trying again.', [
        'lock_duration_seconds' => $rateWindowSeconds,
    ], 429);
}

// -------------------------------------------------------------
// 2. Fetch User by School & Username
// -------------------------------------------------------------
$userStmt = $pdo->prepare("
    SELECT u.*, r.slug as role_slug, r.name as role_name, b.name as branch_name, b.code as branch_code
    FROM users u
    JOIN roles r ON u.role_id = r.id
    LEFT JOIN branches b ON u.branch_id = b.id
    WHERE u.school_id = :school_id AND (LOWER(u.username) = LOWER(:user_name) OR LOWER(u.email) = LOWER(:email_user))
    LIMIT 1
");
$userStmt->execute([
    ':school_id'  => $schoolId,
    ':user_name'  => $username,
    ':email_user' => $username,
]);
$user = $userStmt->fetch();

// -------------------------------------------------------------
// 3. Password Verification (Bcrypt + Automatic Hash Upgrade)
// -------------------------------------------------------------
$isValidPassword = false;

if ($user) {
    if (password_verify($password, $user['password_hash'])) {
        $isValidPassword = true;
    } elseif ($user['password_hash'] === $password) {
        // Transparent auto-upgrade of legacy plaintext password to secure Bcrypt
        $isValidPassword = true;
        $upgradedHash = password_hash($password, PASSWORD_BCRYPT);
        $pdo->prepare("UPDATE users SET password_hash = :hash WHERE id = :id")
            ->execute([':hash' => $upgradedHash, ':id' => $user['id']]);
    }
}

// Record login attempt
$attemptLog = $pdo->prepare("
    INSERT INTO login_attempts (ip_address, username, attempt_time, is_success)
    VALUES (:ip, :username, :now, :success)
");
$attemptLog->execute([
    ':ip'       => $clientIp,
    ':username' => $username,
    ':now'      => time(),
    ':success'  => $isValidPassword ? 1 : 0,
]);

if (!$user || !$isValidPassword) {
    jsonResponse(false, 'Invalid credentials. Please verify your username and password.', [
        'remaining_attempts' => max(0, $maxFailedAttempts - ($failedCount + 1)),
    ], 401);
}

if ($user['status'] === 'suspended') {
    jsonResponse(false, 'Your account is suspended. Please contact the School Administrator.', null, 403);
}

// -------------------------------------------------------------
// 4. Successful Authentication & Session Token
// -------------------------------------------------------------
// Clear failed attempts upon successful login
$pdo->prepare("DELETE FROM login_attempts WHERE username = :username OR ip_address = :ip")
    ->execute([':username' => $username, ':ip' => $clientIp]);

// Update user login timestamp
$pdo->prepare("UPDATE users SET last_login_at = NOW(), last_login_ip = :ip, failed_login_attempts = 0 WHERE id = :id")
    ->execute([':ip' => $clientIp, ':id' => $user['id']]);

// Generate signed authentication token
$tokenPayload = [
    'user_id'   => (int)$user['id'],
    'school_id' => (int)$user['school_id'],
    'branch_id' => $user['branch_id'] ? (int)$user['branch_id'] : null,
    'role'      => $user['role_slug'],
    'username'  => $user['username'],
    'created'   => time(),
    'expires'   => time() + 86400 * 7, // 7 days
];
$tokenSecret = 'alchemist_enterprise_sms_sec_2026_jwt_token_sign_key';
$encodedPayload = base64_encode(json_encode($tokenPayload));
$signature = hash_hmac('sha256', $encodedPayload, $tokenSecret);
$authToken = $encodedPayload . '.' . $signature;

// Write audit log
$audit = $pdo->prepare("
    INSERT INTO audit_logs (school_id, branch_id, user_id, user_name, user_role, action, entity_type, entity_id, ip_address, user_agent)
    VALUES (:school_id, :branch_id, :user_id, :name, :role, 'AUTH_LOGIN_SUCCESS', 'users', :user_id_str, :ip, :ua)
");
$audit->execute([
    ':school_id'   => (int)$user['school_id'],
    ':branch_id'   => $user['branch_id'] ? (int)$user['branch_id'] : null,
    ':user_id'     => (int)$user['id'],
    ':name'        => $user['name'],
    ':role'        => $user['role_slug'],
    ':user_id_str' => (string)$user['id'],
    ':ip'          => $clientIp,
    ':ua'          => substr($_SERVER['HTTP_USER_AGENT'] ?? 'Unknown', 0, 255),
]);

// Return user dossier
jsonResponse(true, 'Authentication successful.', [
    'token' => $authToken,
    'user'  => [
        'id'          => (int)$user['id'],
        'schoolId'    => (int)$user['school_id'],
        'branchId'    => $user['branch_id'] ? (int)$user['branch_id'] : null,
        'branchName'  => $user['branch_name'] ?? 'Main Campus',
        'branchCode'  => $user['branch_code'] ?? 'BR-MAIN',
        'username'    => $user['username'],
        'name'        => $user['name'],
        'email'       => $user['email'],
        'role'        => $user['role_slug'],
        'roleName'    => $user['role_name'],
        'department'  => $user['department'],
    ],
]);
