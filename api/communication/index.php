<?php
// api/communication/index.php
// Communication: Internal Messaging, Public Circulars, and Multi-Audience Announcements
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth_guard.php';

$user = requireAuth($pdo);
$schoolId = (int)$user['school_id'];
$branchId = !empty($_GET['branch_id']) ? (int)$_GET['branch_id'] : ($user['branch_id'] ? (int)$user['branch_id'] : 1);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $audience = !empty($_GET['audience']) ? trim((string)$_GET['audience']) : null;

    $sql = "
        SELECT cn.*, u.name as publisher_name, r.name as publisher_role
        FROM communication_notices cn
        JOIN users u ON cn.created_by_user_id = u.id
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE cn.school_id = :school_id
    ";
    $params = [':school_id' => $schoolId];

    if ($audience && $audience !== 'all') {
        $sql .= " AND (cn.audience = :aud OR cn.audience = 'all')";
        $params[':aud'] = $audience;
    }

    $sql .= " ORDER BY cn.priority = 'urgent' DESC, cn.publish_date DESC, cn.id DESC LIMIT 100";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $notices = $stmt->fetchAll();

    $urgentCount = 0;
    $publishedCount = 0;
    foreach ($notices as $n) {
        if (!empty($n['is_published'])) $publishedCount++;
        if ($n['priority'] === 'urgent') $urgentCount++;
    }

    jsonResponse(true, 'Communication notices retrieved.', [
        'notices'         => $notices,
        'count'           => count($notices),
        'published_count' => $publishedCount,
        'urgent_count'    => $urgentCount,
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAuth($pdo, ['superadmin', 'admin', 'principal', 'teacher']);

    $input = getJsonInput();
    $action = $input['action'] ?? 'publish_notice';

    if ($action === 'publish_notice') {
        $title         = trim((string)($input['title'] ?? ''));
        $content       = trim((string)($input['content'] ?? ''));
        $audience      = in_array($input['audience'] ?? '', ['all', 'students', 'teachers', 'parents', 'staff'], true) ? $input['audience'] : 'all';
        $priority      = in_array($input['priority'] ?? '', ['normal', 'high', 'urgent'], true) ? $input['priority'] : 'normal';
        $publishDate   = trim((string)($input['publish_date'] ?? date('Y-m-d')));
        $attachmentUrl = !empty($input['attachment_url']) ? trim((string)$input['attachment_url']) : null;

        if (empty($title) || empty($content)) {
            jsonResponse(false, 'Notice title and content are required.', null, 400);
        }

        $stmt = $pdo->prepare("
            INSERT INTO communication_notices 
            (school_id, branch_id, title, content, audience, priority, is_published, publish_date, attachment_url, created_by_user_id)
            VALUES (:school_id, :branch_id, :title, :content, :audience, :priority, 1, :publish_date, :attachment_url, :user_id)
        ");
        $stmt->execute([
            ':school_id'      => $schoolId,
            ':branch_id'      => $branchId,
            ':title'          => $title,
            ':content'        => $content,
            ':audience'       => $audience,
            ':priority'       => $priority,
            ':publish_date'   => $publishDate,
            ':attachment_url' => $attachmentUrl,
            ':user_id'        => (int)$user['id'],
        ]);

        $noticeId = (int)$pdo->lastInsertId();

        // Also broadcast in-app notification to users of that school
        try {
            $notifStmt = $pdo->prepare("
                INSERT INTO notifications (school_id, user_id, title, message, type, channel, status)
                SELECT :school_id, u.id, :notif_title, :notif_body, 'announcement', 'in_app', 'sent'
                FROM users u
                WHERE u.school_id = :school_id_filter
                LIMIT 50
            ");
            $notifStmt->execute([
                ':school_id'        => $schoolId,
                ':notif_title'      => "Circular: " . $title,
                ':notif_body'       => substr($content, 0, 140),
                ':school_id_filter' => $schoolId,
            ]);
        } catch (\Throwable $th) {
            // Non-blocking notification sync
        }

        jsonResponse(true, 'Communication notice published and broadcasted.', [
            'notice_id' => $noticeId,
        ]);
    }

    if ($action === 'toggle_status') {
        $noticeId    = (int)($input['id'] ?? 0);
        $isPublished = !empty($input['is_published']) ? 1 : 0;

        $stmt = $pdo->prepare("
            UPDATE communication_notices 
            SET is_published = :status 
            WHERE id = :id AND school_id = :school_id
        ");
        $stmt->execute([
            ':status'    => $isPublished,
            ':id'        => $noticeId,
            ':school_id' => $schoolId,
        ]);

        jsonResponse(true, 'Notice publication status updated.');
    }

    jsonResponse(false, 'Invalid action specified.', null, 400);
}

