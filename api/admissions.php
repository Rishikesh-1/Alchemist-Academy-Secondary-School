<?php
// api/admissions.php
declare(strict_types=1);

require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/db.php';

$schoolId = resolveSchoolId($pdo);
$method = $_SERVER['REQUEST_METHOD'];

// Ensure admission_inquiries table exists
try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `admission_inquiries` (
          `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          `school_id` INT UNSIGNED NOT NULL DEFAULT 1,
          `parent_name` VARCHAR(150) NOT NULL,
          `phone` VARCHAR(50) NOT NULL,
          `email` VARCHAR(150) NULL,
          `child_grade` VARCHAR(100) NOT NULL,
          `message` TEXT NULL,
          `lead_status` ENUM('new', 'contacted', 'campus_visited', 'enrolled', 'closed') DEFAULT 'new',
          `counselor_notes` TEXT NULL,
          `ip_address` VARCHAR(45) NULL,
          `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX `idx_school_status` (`school_id`, `lead_status`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
} catch (PDOException $e) {
    // Continue
}

// 1. PUBLIC INQUIRY SUBMISSION (POST)
if ($method === 'POST') {
    $input = getJsonInput();

    // Sanitize
    $parentName = trim(strip_tags((string)($input['parentName'] ?? $input['parent_name'] ?? '')));
    $phone      = trim(strip_tags((string)($input['phone'] ?? '')));
    $email      = trim(strip_tags((string)($input['email'] ?? '')));
    $childGrade = trim(strip_tags((string)($input['childGrade'] ?? $input['grade'] ?? 'Grade 1')));
    $message    = trim(strip_tags((string)($input['message'] ?? '')));

    if (empty($parentName) || strlen($parentName) < 2) {
        jsonResponse(false, 'Please provide parent or guardian name', null, 400);
    }

    if (empty($phone) || strlen($phone) < 7) {
        jsonResponse(false, 'Please provide a valid phone contact number', null, 400);
    }

    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

    try {
        $stmt = $pdo->prepare("
            INSERT INTO admission_inquiries 
            (school_id, parent_name, phone, email, child_grade, message, lead_status, ip_address)
            VALUES (:school_id, :parent_name, :phone, :email, :child_grade, :message, 'new', :ip)
        ");
        $stmt->execute([
            ':school_id'    => $schoolId,
            ':parent_name'  => $parentName,
            ':phone'        => $phone,
            ':email'        => !empty($email) ? $email : null,
            ':child_grade'  => $childGrade,
            ':message'      => !empty($message) ? $message : null,
            ':ip'           => $ip,
        ]);

        jsonResponse(true, 'Admission inquiry submitted successfully. Our team will contact you soon.', [
            'inquiry_id' => $pdo->lastInsertId(),
        ], 201);
    } catch (PDOException $e) {
        jsonResponse(false, 'Failed to save inquiry: ' . $e->getMessage(), null, 500);
    }
}

// 2. ADMIN LIST INQUIRIES (GET)
if ($method === 'GET') {
    $statusFilter = $_GET['status'] ?? null;
    $sql = "SELECT id, parent_name, phone, email, child_grade, message, lead_status, counselor_notes, created_at 
            FROM admission_inquiries WHERE school_id = :school_id";
    $params = [':school_id' => $schoolId];

    if ($statusFilter && in_array($statusFilter, ['new', 'contacted', 'campus_visited', 'enrolled', 'closed'], true)) {
        $sql .= " AND lead_status = :status";
        $params[':status'] = $statusFilter;
    }

    $sql .= " ORDER BY id DESC LIMIT 200";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $inquiries = $stmt->fetchAll();

        jsonResponse(true, 'Inquiries retrieved successfully', [
            'count' => count($inquiries),
            'inquiries' => $inquiries,
        ]);
    } catch (PDOException $e) {
        jsonResponse(false, 'Failed to fetch inquiries: ' . $e->getMessage(), null, 500);
    }
}

// 3. ADMIN UPDATE LEAD STATUS (PUT / PATCH)
if ($method === 'PUT' || $method === 'PATCH') {
    $input = getJsonInput();
    $inquiryId = (int)($input['id'] ?? 0);
    $leadStatus = $input['lead_status'] ?? $input['status'] ?? null;
    $notes = $input['counselor_notes'] ?? $input['notes'] ?? null;

    if ($inquiryId <= 0 || !$leadStatus) {
        jsonResponse(false, 'Missing inquiry ID or status', null, 400);
    }

    try {
        $stmt = $pdo->prepare("
            UPDATE admission_inquiries 
            SET lead_status = :status, 
                counselor_notes = COALESCE(:notes, counselor_notes),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = :id AND school_id = :school_id
        ");
        $stmt->execute([
            ':status'    => $leadStatus,
            ':notes'     => $notes,
            ':id'        => $inquiryId,
            ':school_id' => $schoolId,
        ]);

        jsonResponse(true, 'Lead status updated successfully', [
            'id' => $inquiryId,
            'lead_status' => $leadStatus,
        ]);
    } catch (PDOException $e) {
        jsonResponse(false, 'Failed to update lead: ' . $e->getMessage(), null, 500);
    }
}

jsonResponse(false, 'Method not allowed', null, 405);

