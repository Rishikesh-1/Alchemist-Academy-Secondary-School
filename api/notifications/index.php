<?php
// api/notifications/index.php
// Multi-channel notification center (In-App, Email, SMS) with role targeting
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth_guard.php';

$user = requireAuth($pdo);
$schoolId = (int)$user['school_id'];
$branchId = !empty($_GET['branch_id']) ? (int)$_GET['branch_id'] : ($user['branch_id'] ? (int)$user['branch_id'] : null);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $role = $user['role_slug'];
    $userId = (int)$user['id'];

    $sql = "
        SELECT * FROM notifications 
        WHERE school_id = :school_id 
          AND (target_user_id = :uid OR target_role = :role OR target_role = 'all' OR target_role IS NULL)
    ";
    $params = [
        ':school_id' => $schoolId,
        ':uid'       => $userId,
        ':role'      => $role,
    ];

    if ($branchId) {
        $sql .= " AND (branch_id = :branch_id OR branch_id IS NULL)";
        $params[':branch_id'] = $branchId;
    }

    $sql .= " ORDER BY created_at DESC LIMIT 50";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $notifications = $stmt->fetchAll();

    jsonResponse(true, 'Notifications retrieved.', [
        'notifications' => $notifications,
        'unread_count'  => count(array_filter($notifications, fn($n) => empty($n['read_at']))),
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAuth($pdo, ['superadmin', 'admin', 'principal', 'academic']);

    $input = getJsonInput();
    $title = trim((string)($input['title'] ?? ''));
    $message = trim((string)($input['message'] ?? ''));
    $channel = trim((string)($input['channel'] ?? 'in_app')); // in_app, email, sms
    $targetRole = trim((string)($input['target_role'] ?? 'all'));
    $targetUserId = !empty($input['target_user_id']) ? (int)$input['target_user_id'] : null;

    if (empty($title) || empty($message)) {
        jsonResponse(false, 'Notification title and message are required.', null, 400);
    }

    $ins = $pdo->prepare("
        INSERT INTO notifications 
        (school_id, branch_id, title, message, channel, target_role, target_user_id, status)
        VALUES 
        (:school_id, :branch_id, :title, :message, :channel, :target_role, :target_user_id, 'sent')
    ");

    $ins->execute([
        ':school_id'       => $schoolId,
        ':branch_id'       => $branchId,
        ':title'           => $title,
        ':message'         => $message,
        ':channel'         => $channel,
        ':target_role'     => $targetRole,
        ':target_user_id'  => $targetUserId,
    ]);

    $notifId = (int)$pdo->lastInsertId();

    jsonResponse(true, "Notification dispatched via {$channel} to {$targetRole}.", [
        'notification_id' => $notifId,
    ]);
}

jsonResponse(false, 'Method not allowed.', null, 405);
