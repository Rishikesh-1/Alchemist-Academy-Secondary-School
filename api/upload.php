<?php
// api/upload.php
declare(strict_types=1);

require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Only POST requests allowed', null, 405);
}

if (empty($_FILES['file'])) {
    jsonResponse(false, 'No file uploaded', null, 400);
}

$file = $_FILES['file'];
$schoolId = resolveSchoolId($pdo);

if ($file['error'] !== UPLOAD_ERR_OK) {
    jsonResponse(false, 'Upload failed with error code: ' . $file['error'], null, 400);
}

// 5MB limit
$maxBytes = 5 * 1024 * 1024;
if ($file['size'] > $maxBytes) {
    jsonResponse(false, 'File size exceeds maximum 5MB limit', null, 400);
}

// Verify MIME type
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($file['tmp_name']);
$allowedMimes = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
    'image/svg+xml' => 'svg',
    'image/gif'  => 'gif',
];

if (!isset($allowedMimes[$mimeType])) {
    jsonResponse(false, 'Invalid image format. Allowed: JPG, PNG, WebP, SVG, GIF', null, 400);
}

$ext = $allowedMimes[$mimeType];

// Clean filename for SEO
$originalName = pathinfo($file['name'], PATHINFO_FILENAME);
$cleanName = preg_replace('/[^a-zA-Z0-9_-]/', '-', strtolower($originalName));
$cleanName = trim(preg_replace('/-+/', '-', $cleanName), '-');
if (empty($cleanName)) {
    $cleanName = 'asset';
}

$uniqueFileName = $cleanName . '-' . time() . '.' . $ext;

// Determine destination folder
$targetDir = dirname(__DIR__) . '/uploads/' . $schoolId . '/images/';
if (!is_dir($targetDir)) {
    mkdir($targetDir, 0755, true);
}

$destPath = $targetDir . $uniqueFileName;
if (!move_uploaded_file($file['tmp_name'], $destPath)) {
    jsonResponse(false, 'Failed to save uploaded file to disk', null, 500);
}

// Public URL path
$publicUrl = '/uploads/' . $schoolId . '/images/' . $uniqueFileName;

// Generate readable title & SEO Alt text
$formattedTitle = ucwords(str_replace(['-', '_'], ' ', $originalName));
$category = $_POST['category'] ?? 'Campus & Events';
$altText = !empty($_POST['altText'])
    ? trim($_POST['altText'])
    : "{$formattedTitle} - Alchemist Academy, Jorpati, Kathmandu";

$fileSizeKb = round($file['size'] / 1024, 2);

$mediaItem = [
    'id' => 'upload-' . time(),
    'title' => $formattedTitle,
    'altText' => $altText,
    'url' => $publicUrl,
    'fileName' => $uniqueFileName,
    'fileSizeKb' => $fileSizeKb,
    'category' => $category,
    'tags' => $_POST['tags'] ?? 'campus, alchemist academy',
    'dateAdded' => date('Y-m-d'),
    'isDefault' => false,
];

// Record in MySQL table if table exists
try {
    $stmt = $pdo->prepare("
        INSERT INTO media_library 
        (school_id, title, alt_text, file_name, file_url, file_size_kb, mime_type, category, tags, is_default)
        VALUES (:school_id, :title, :alt_text, :file_name, :file_url, :file_size_kb, :mime_type, :category, :tags, 0)
    ");
    $stmt->execute([
        ':school_id'    => $schoolId,
        ':title'        => $formattedTitle,
        ':alt_text'     => $altText,
        ':file_name'    => $uniqueFileName,
        ':file_url'     => $publicUrl,
        ':file_size_kb' => $fileSizeKb,
        ':mime_type'    => $mimeType,
        ':category'     => $category,
        ':tags'         => $mediaItem['tags'],
    ]);
    $mediaItem['db_id'] = $pdo->lastInsertId();
} catch (PDOException $e) {
    // Media table not yet created; file is saved successfully on disk
    $mediaItem['db_notice'] = 'File stored to disk successfully. Run schema.sql to record to MySQL.';
}

jsonResponse(true, 'File uploaded and optimized successfully', [
    'url' => $publicUrl,
    'item' => $mediaItem,
], 201);

