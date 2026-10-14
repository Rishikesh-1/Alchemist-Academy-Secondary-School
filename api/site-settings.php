<?php
// api/site-settings.php
declare(strict_types=1);

require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/db.php';

$schoolId = resolveSchoolId($pdo);
$method = $_SERVER['REQUEST_METHOD'];

// Ensure table exists
try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `site_settings` (
          `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          `school_id` INT UNSIGNED NOT NULL DEFAULT 1,
          `settings_payload` LONGTEXT NOT NULL,
          `version` INT UNSIGNED DEFAULT 1,
          `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY `unique_school_settings` (`school_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
} catch (PDOException $e) {
    // Continue
}

if ($method === 'GET') {
    try {
        $stmt = $pdo->prepare("SELECT settings_payload, version, updated_at FROM site_settings WHERE school_id = :school_id LIMIT 1");
        $stmt->execute([':school_id' => $schoolId]);
        $row = $stmt->fetch();

        if ($row && !empty($row['settings_payload'])) {
            $payload = json_decode($row['settings_payload'], true);
            if (is_array($payload)) {
                // Return cached headers for ultra-fast CDN/browser load
                header('Cache-Control: public, max-age=60, stale-while-revalidate=300');
                jsonResponse(true, 'Site settings loaded from MySQL', [
                    'school_id' => $schoolId,
                    'settings' => $payload,
                    'version' => $row['version'],
                    'updated_at' => $row['updated_at'],
                ]);
            }
        }

        // No record yet in database
        jsonResponse(true, 'No custom settings in database; using defaults', [
            'school_id' => $schoolId,
            'settings' => null,
        ]);
    } catch (PDOException $e) {
        jsonResponse(false, 'Failed to fetch settings: ' . $e->getMessage(), null, 500);
    }
}

if ($method === 'POST') {
    $input = getJsonInput();
    if (empty($input)) {
        jsonResponse(false, 'Invalid or empty settings payload', null, 400);
    }

    $payloadJson = json_encode($input, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if (!$payloadJson) {
        jsonResponse(false, 'JSON encoding error', null, 400);
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO site_settings (school_id, settings_payload, version)
            VALUES (:school_id, :payload, 1)
            ON DUPLICATE KEY UPDATE 
                settings_payload = VALUES(settings_payload),
                version = version + 1,
                updated_at = CURRENT_TIMESTAMP
        ");
        $stmt->execute([
            ':school_id' => $schoolId,
            ':payload'   => $payloadJson,
        ]);

        jsonResponse(true, 'Site settings saved successfully to MySQL database', [
            'school_id' => $schoolId,
            'updated_at' => date('Y-m-d H:i:s'),
        ]);
    } catch (PDOException $e) {
        jsonResponse(false, 'Database error while saving settings: ' . $e->getMessage(), null, 500);
    }
}

jsonResponse(false, 'Method not allowed', null, 405);

