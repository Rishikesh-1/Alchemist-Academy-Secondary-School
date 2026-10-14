<?php
// api/media.php
declare(strict_types=1);

require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/db.php';

$schoolId = resolveSchoolId($pdo);
$method = $_SERVER['REQUEST_METHOD'];

// Ensure media_library table exists
try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `media_library` (
          `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          `school_id` INT UNSIGNED NOT NULL DEFAULT 1,
          `title` VARCHAR(255) NOT NULL,
          `alt_text` VARCHAR(500) NOT NULL,
          `file_name` VARCHAR(255) NOT NULL,
          `file_url` VARCHAR(500) NOT NULL,
          `file_size_kb` DECIMAL(10, 2) DEFAULT 0.00,
          `mime_type` VARCHAR(100) DEFAULT 'image/jpeg',
          `category` VARCHAR(100) DEFAULT 'Campus & Events',
          `tags` VARCHAR(255) DEFAULT '',
          `is_default` TINYINT(1) DEFAULT 0,
          `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX `idx_school_cat` (`school_id`, `category`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
} catch (PDOException $e) {
    // Continue
}

// 1. LIST MEDIA (GET)
if ($method === 'GET') {
    try {
        $stmt = $pdo->prepare("
            SELECT id, title, alt_text AS altText, file_url AS url, category, tags, is_default AS isDefault, 
                   file_size_kb AS fileSizeKb, created_at AS dateAdded
            FROM media_library 
            WHERE school_id = :school_id 
            ORDER BY id DESC
        ");
        $stmt->execute([':school_id' => $schoolId]);
        $items = $stmt->fetchAll();

        jsonResponse(true, 'Media library loaded', [
            'school_id' => $schoolId,
            'count'     => count($items),
            'items'     => $items,
        ]);
    } catch (PDOException $e) {
        jsonResponse(false, 'Failed to fetch media: ' . $e->getMessage(), null, 500);
    }
}

// 2. ADD / UPDATE MEDIA ITEM (POST / PUT)
if ($method === 'POST') {
    $input = getJsonInput();

    // Check if this is an update request with ID
    $id = (int)($input['id'] ?? 0);
    $title = trim(strip_tags((string)($input['title'] ?? 'Asset')));
    $altText = trim(strip_tags((string)($input['altText'] ?? $title)));
    $category = trim(strip_tags((string)($input['category'] ?? 'Campus & Events')));
    $tags = trim(strip_tags((string)($input['tags'] ?? '')));
    $url = trim((string)($input['url'] ?? ''));

    if ($id > 0) {
        // UPDATE existing SEO metadata
        try {
            $stmt = $pdo->prepare("
                UPDATE media_library 
                SET title = :title, alt_text = :alt_text, category = :category, tags = :tags 
                WHERE id = :id AND school_id = :school_id
            ");
            $stmt->execute([
                ':title'     => $title,
                ':alt_text'  => $altText,
                ':category'  => $category,
                ':tags'      => $tags,
                ':id'        => $id,
                ':school_id' => $schoolId,
            ]);

            jsonResponse(true, 'Media SEO metadata updated successfully');
        } catch (PDOException $e) {
            jsonResponse(false, 'Update failed: ' . $e->getMessage(), null, 500);
        }
    } else {
        // INSERT new external URL asset
        if (empty($url)) {
            jsonResponse(false, 'URL is required for external media asset', null, 400);
        }

        try {
            $stmt = $pdo->prepare("
                INSERT INTO media_library (school_id, title, alt_text, file_name, file_url, category, tags, is_default)
                VALUES (:school_id, :title, :alt_text, :file_name, :file_url, :category, :tags, 0)
            ");
            $stmt->execute([
                ':school_id' => $schoolId,
                ':title'     => $title,
                ':alt_text'  => $altText,
                ':file_name' => basename(parse_url($url, PHP_URL_PATH) ?: 'external-image'),
                ':file_url'  => $url,
                ':category'  => $category,
                ':tags'      => $tags,
            ]);

            jsonResponse(true, 'External web asset added to media library', [
                'id' => $pdo->lastInsertId(),
                'title' => $title,
                'altText' => $altText,
                'url' => $url,
            ], 201);
        } catch (PDOException $e) {
            jsonResponse(false, 'Failed to insert asset: ' . $e->getMessage(), null, 500);
        }
    }
}

// 3. DELETE MEDIA ITEM (DELETE)
if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if ($id <= 0) {
        jsonResponse(false, 'Invalid media ID', null, 400);
    }

    try {
        $stmt = $pdo->prepare("SELECT file_url, is_default FROM media_library WHERE id = :id AND school_id = :school_id");
        $stmt->execute([':id' => $id, ':school_id' => $schoolId]);
        $row = $stmt->fetch();

        if (!$row) {
            jsonResponse(false, 'Media asset not found', null, 404);
        }

        if (!empty($row['is_default'])) {
            jsonResponse(false, 'Default template assets cannot be deleted', null, 403);
        }

        // Delete from DB
        $del = $pdo->prepare("DELETE FROM media_library WHERE id = :id AND school_id = :school_id");
        $del->execute([':id' => $id, ':school_id' => $schoolId]);

        // Attempt to remove physical file if stored locally
        $filePath = dirname(__DIR__) . $row['file_url'];
        if (file_exists($filePath) && is_file($filePath)) {
            @unlink($filePath);
        }

        jsonResponse(true, 'Media asset deleted successfully');
    } catch (PDOException $e) {
        jsonResponse(false, 'Delete failed: ' . $e->getMessage(), null, 500);
    }
}

jsonResponse(false, 'Method not allowed', null, 405);

