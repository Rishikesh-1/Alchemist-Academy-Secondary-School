<?php
// api/audit/index.php
// Enterprise immutable audit trail endpoint for marks, fees, and student record modifications
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth_guard.php';

$user = requireAuth($pdo, ['superadmin', 'admin', 'principal']);
$schoolId = (int)$user['school_id'];
$branchId = !empty($_GET['branch_id']) ? (int)$_GET['branch_id'] : ($user['branch_id'] ? (int)$user['branch_id'] : null);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $entityType = trim((string)($_GET['entity_type'] ?? ''));
    $action = trim((string)($_GET['action'] ?? ''));
    $search = trim((string)($_GET['search'] ?? ''));
    $limit = min(200, max(10, (int)($_GET['limit'] ?? 50)));

    $sql = "
        SELECT 
            al.*,
            b.name as branch_name
        FROM audit_logs al
        LEFT JOIN branches b ON al.branch_id = b.id
        WHERE al.school_id = :school_id
    ";
    $params = [':school_id' => $schoolId];

    if ($branchId) {
        $sql .= " AND (al.branch_id = :branch_id OR al.branch_id IS NULL)";
        $params[':branch_id'] = $branchId;
    }

    if (!empty($entityType)) {
        $sql .= " AND al.entity_type = :entity";
        $params[':entity'] = $entityType;
    }

    if (!empty($action)) {
        $sql .= " AND al.action = :act";
        $params[':act'] = $action;
    }

    if (!empty($search)) {
        $sql .= " AND (al.user_name LIKE :s1 OR al.action LIKE :s2 OR al.entity_id LIKE :s3)";
        $wildcard = "%{$search}%";
        $params[':s1'] = $wildcard;
        $params[':s2'] = $wildcard;
        $params[':s3'] = $wildcard;
    }

    $sql .= " ORDER BY al.id DESC LIMIT " . (int)$limit;

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $logs = $stmt->fetchAll();

    foreach ($logs as &$log) {
        $log['old_values'] = !empty($log['old_values']) ? json_decode($log['old_values'], true) : null;
        $log['new_values'] = !empty($log['new_values']) ? json_decode($log['new_values'], true) : null;
    }
    unset($log);

    jsonResponse(true, 'Audit trail logs retrieved.', [
        'logs'  => $logs,
        'count' => count($logs),
    ]);
}

jsonResponse(false, 'Method not allowed.', null, 405);
