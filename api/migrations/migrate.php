<?php
// api/migrations/migrate.php
// Safe, idempotent database migration runner
declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';

header('Content-Type: text/plain; charset=utf-8');

echo "========================================================\n";
echo " ALCHEMIST ACADEMY ENTERPRISE SMS - DATABASE MIGRATOR\n";
echo "========================================================\n\n";

try {
    // 1. Ensure migrations tracking table exists
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `migrations` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `migration` VARCHAR(255) NOT NULL UNIQUE,
            `batch` INT UNSIGNED NOT NULL DEFAULT 1,
            `executed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    // Fetch already executed migrations
    $stmt = $pdo->query("SELECT migration FROM migrations");
    $applied = $stmt->fetchAll(PDO::FETCH_COLUMN);

    // Get current batch number
    $batchStmt = $pdo->query("SELECT MAX(batch) FROM migrations");
    $currentBatch = (int)($batchStmt->fetchColumn() ?: 0) + 1;

    // Discover migration sql files
    $files = glob(__DIR__ . '/*.sql');
    sort($files);

    $executedCount = 0;

    foreach ($files as $filePath) {
        $filename = basename($filePath);
        if (in_array($filename, ['seed_data.sql'], true)) {
            continue; // Seed file run separately
        }

        if (in_array($filename, $applied, true)) {
            echo "[✓ SKIP] Already executed: {$filename}\n";
            continue;
        }

        echo "[RUNNING] Executing migration: {$filename} ... ";
        $sql = file_get_contents($filePath);
        if ($sql === false) {
            throw new RuntimeException("Cannot read file: {$filename}");
        }

        // Execute SQL script
        $pdo->exec($sql);

        // Record in tracking table
        $ins = $pdo->prepare("INSERT INTO migrations (migration, batch) VALUES (:migration, :batch)");
        $ins->execute([
            ':migration' => $filename,
            ':batch'     => $currentBatch,
        ]);

        echo "SUCCESS!\n";
        $executedCount++;
    }

    echo "\n========================================================\n";
    if ($executedCount === 0) {
        echo "Database is already up to date. No pending migrations.\n";
    } else {
        echo "Successfully executed {$executedCount} migration(s) in Batch #{$currentBatch}.\n";
    }
    echo "========================================================\n";

} catch (Throwable $e) {
    echo "\n[ERROR] Migration failed:\n" . $e->getMessage() . "\n";
    if (PHP_SAPI !== 'cli') {
        http_response_code(500);
    }
    exit(1);
}

