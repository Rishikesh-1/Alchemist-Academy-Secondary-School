<?php
// api/students/import_csv.php
// Bulk student CSV/Excel importer with transaction safety and audit tracking
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth_guard.php';

$user = requireAuth($pdo, ['superadmin', 'admin', 'principal', 'academic', 'admissions']);
$schoolId = (int)$user['school_id'];
$branchId = !empty($_GET['branch_id']) ? (int)$_GET['branch_id'] : ($user['branch_id'] ? (int)$user['branch_id'] : 1);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method not allowed. Use POST.', null, 405);
}

// Accepts either raw CSV file upload or JSON payload containing rows array
$rows = [];

if (!empty($_FILES['file']['tmp_name'])) {
    $fileHandle = fopen($_FILES['file']['tmp_name'], 'r');
    if ($fileHandle === false) {
        jsonResponse(false, 'Unable to read uploaded file.', null, 400);
    }

    $header = fgetcsv($fileHandle);
    if (!$header) {
        jsonResponse(false, 'CSV file is empty or missing header row.', null, 400);
    }

    $header = array_map(function($h) {
        return strtolower(trim(str_replace([' ', '-', '/'], '_', $h)));
    }, $header);

    while (($line = fgetcsv($fileHandle)) !== false) {
        if (count($line) === count($header)) {
            $rows[] = array_combine($header, array_map('trim', $line));
        }
    }
    fclose($fileHandle);
} else {
    $input = getJsonInput();
    $rows = $input['rows'] ?? [];
    if (!is_array($rows) || empty($rows)) {
        jsonResponse(false, 'No CSV file or rows provided for bulk import.', null, 400);
    }
}

// Pre-fetch classes and sections to map names to IDs
$classesMap = [];
$clsStmt = $pdo->prepare("SELECT id, LOWER(name) as name FROM classes WHERE school_id = :school_id");
$clsStmt->execute([':school_id' => $schoolId]);
foreach ($clsStmt->fetchAll() as $c) {
    $classesMap[$c['name']] = (int)$c['id'];
}

// Pre-fetch default academic year
$ayStmt = $pdo->prepare("SELECT id FROM academic_years WHERE school_id = :s AND is_current = 1 LIMIT 1");
$ayStmt->execute([':s' => $schoolId]);
$academicYearId = (int)$ayStmt->fetchColumn() ?: null;

$imported = 0;
$skipped = 0;
$errors = [];

$pdo->beginTransaction();

try {
    $insertStmt = $pdo->prepare("
        INSERT INTO students 
        (school_id, branch_id, academic_year_id, class_id, admission_no, roll_no, first_name, last_name, gender, guardian_name, guardian_phone, guardian_email, address, status)
        VALUES 
        (:school_id, :branch_id, :academic_year_id, :class_id, :admission_no, :roll_no, :first_name, :last_name, :gender, :guardian_name, :guardian_phone, :guardian_email, :address, 'active')
        ON DUPLICATE KEY UPDATE 
            first_name = VALUES(first_name),
            last_name = VALUES(last_name),
            guardian_name = VALUES(guardian_name),
            guardian_phone = VALUES(guardian_phone)
    ");

    foreach ($rows as $index => $row) {
        $firstName = $row['first_name'] ?? $row['name'] ?? $row['student_name'] ?? '';
        $lastName = $row['last_name'] ?? '';
        
        // If single name provided, split it
        if (empty($lastName) && !empty($firstName)) {
            $parts = explode(' ', $firstName, 2);
            $firstName = $parts[0];
            $lastName = $parts[1] ?? 'Student';
        }

        if (empty($firstName)) {
            $skipped++;
            continue;
        }

        $className = strtolower(trim((string)($row['class'] ?? $row['grade'] ?? 'grade 10')));
        $classId = $classesMap[$className] ?? null;
        if (!$classId) {
            // Pick first class if not matched
            $classId = !empty($classesMap) ? reset($classesMap) : null;
        }

        $admissionNo = trim((string)($row['admission_no'] ?? 'ADM-' . date('Y') . '-' . str_pad((string)($index + 100), 4, '0', STR_PAD_LEFT)));
        $rollNo = !empty($row['roll_no']) ? (int)$row['roll_no'] : ($index + 1);
        $gender = strtolower(trim((string)($row['gender'] ?? 'other')));
        if (!in_array($gender, ['male', 'female', 'other'], true)) $gender = 'other';
        $guardianName = trim((string)($row['guardian_name'] ?? $row['parent_name'] ?? ''));
        $guardianPhone = trim((string)($row['guardian_phone'] ?? $row['phone'] ?? ''));
        $guardianEmail = trim((string)($row['guardian_email'] ?? $row['email'] ?? ''));
        $address = trim((string)($row['address'] ?? 'Kathmandu, Nepal'));

        $insertStmt->execute([
            ':school_id'        => $schoolId,
            ':branch_id'        => $branchId,
            ':academic_year_id' => $academicYearId,
            ':class_id'         => $classId,
            ':admission_no'     => $admissionNo,
            ':roll_no'          => $rollNo,
            ':first_name'       => $firstName,
            ':last_name'        => $lastName,
            ':gender'           => $gender,
            ':guardian_name'    => $guardianName,
            ':guardian_phone'   => $guardianPhone,
            ':guardian_email'   => $guardianEmail,
            ':address'          => $address,
        ]);

        $imported++;
    }

    $pdo->commit();

    // Audit log
    logAuditAction(
        $pdo,
        $schoolId,
        $branchId,
        (int)$user['id'],
        $user['name'],
        $user['role_slug'],
        'STUDENT_BULK_IMPORT',
        'students',
        'bulk',
        null,
        ['imported_count' => $imported, 'skipped_count' => $skipped]
    );

    jsonResponse(true, "Successfully imported {$imported} student profiles.", [
        'imported_count' => $imported,
        'skipped_count'  => $skipped,
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    jsonResponse(false, 'CSV import failed: ' . $e->getMessage(), null, 500);
}
