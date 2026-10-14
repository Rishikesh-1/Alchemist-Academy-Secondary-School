<?php
// api/config/db.php
declare(strict_types=1);

// Optional custom credentials file for cPanel
$envFile = __DIR__ . '/env.php';
if (file_exists($envFile)) {
    $config = require $envFile;
} else {
    // Auto-detect environment: Local XAMPP vs cPanel
    $hostName = $_SERVER['SERVER_NAME'] ?? $_SERVER['HTTP_HOST'] ?? '';
    $isLocal = in_array($hostName, ['localhost', '127.0.0.1'], true) || str_contains($hostName, '192.168.');

    $config = [
        'host' => $isLocal ? '127.0.0.1' : 'localhost',
        'dbname' => $isLocal ? 'alchemist_academy' : 'codixsqu_alchemist',
        'user' => $isLocal ? 'root' : 'codixsqu_alchemist',
        'pass' => $isLocal ? '' : 'AlchemistDbPass2026!',
    ];
}

try {
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

