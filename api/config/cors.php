<?php
// api/config/cors.php
declare(strict_types=1);

// Send clean JSON headers & allow cross-origin requests
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-School-Id, X-Requested-With');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Helper: Standard JSON response
function jsonResponse(bool $success, string $message, mixed $data = null, int $statusCode = 200): void {
    http_response_code($statusCode);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data'    => $data,
        'timestamp' => date('Y-m-d H:i:s'),
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

// Helper: Parse JSON body
function getJsonInput(): array {
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

// Helper: Multi-tenant resolver (resolves school_id)
function resolveSchoolId(PDO $pdo): int {
    if (!empty($_SERVER['HTTP_X_SCHOOL_ID'])) {
        return max(1, (int)$_SERVER['HTTP_X_SCHOOL_ID']);
    }
    if (!empty($_GET['school_id'])) {
        return max(1, (int)$_GET['school_id']);
    }

    // Default to Pilot Tenant (Alchemist Academy = ID 1)
    return 1;
}

