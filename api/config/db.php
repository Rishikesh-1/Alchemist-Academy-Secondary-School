<?php
// api/config/db.php
declare(strict_types=1);

$hostName = $_SERVER['SERVER_NAME'] ?? $_SERVER['HTTP_HOST'] ?? '';
$isLocal = PHP_SAPI === 'cli' || in_array($hostName, ['localhost', '127.0.0.1', '::1'], true) || str_contains($hostName, '192.168.');

$envLocalFile = __DIR__ . '/env.local.php';
$envFile = __DIR__ . '/env.php';

if (file_exists($envLocalFile)) {
    $config = require $envLocalFile;
} elseif ($isLocal) {
    $config = [
        'host'   => '127.0.0.1',
        'dbname' => 'alchemist_academy',
        'user'   => 'root',
        'pass'   => '',
    ];
} elseif (file_exists($envFile)) {
    $config = require $envFile;
} else {
    $config = [
        'host'   => 'localhost',
        'dbname' => 'codixsqu_alchemist',
        'user'   => 'codixsqu_alchemist',
        'pass'   => 'AlchemistDbPass2026!',
    ];
}

try {
    // If local, make sure database exists before selecting it
    if ($isLocal) {
        $initPdo = new PDO("mysql:host={$config['host']};charset=utf8mb4", $config['user'], $config['pass'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]);
        $initPdo->exec("CREATE DATABASE IF NOT EXISTS `{$config['dbname']}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    }

    $pdo = new PDO(
        "mysql:host={$config['host']};dbname={$config['dbname']};charset=utf8mb4",
        $config['user'],
        $config['pass'],
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );
} catch (PDOException $e) {
    // If database connection fails, send clean JSON error without crashing
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed. Please ensure MySQL database is created in cPanel.',
        'error' => ($isLocal ?? true) ? $e->getMessage() : null
    ]);
    exit;
}

