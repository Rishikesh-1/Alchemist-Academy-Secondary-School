<?php
// api/hr/index.php
// Human Resources: Staff Directory, Daily Staff Attendance, and Leave Management
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth_guard.php';

$user = requireAuth($pdo);
$schoolId = (int)$user['school_id'];
$branchId = !empty($_GET['branch_id']) ? (int)$_GET['branch_id'] : ($user['branch_id'] ? (int)$user['branch_id'] : 1);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $type = trim((string)($_GET['type'] ?? 'overview'));
    $date = trim((string)($_GET['date'] ?? date('Y-m-d')));

    // Staff Directory
    $staffStmt = $pdo->prepare("
        SELECT u.id, u.name, u.email, u.phone, u.status, u.created_at, r.name as role_name, r.description as role_desc
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.school_id = :school_id
          AND r.name NOT IN ('student', 'parent')
        ORDER BY r.name ASC, u.name ASC
    ");
    $staffStmt->execute([':school_id' => $schoolId]);
    $staffMembers = $staffStmt->fetchAll();

    // Staff Attendance for selected date
    $attStmt = $pdo->prepare("
        SELECT sa.*, u.name as staff_name, u.email as staff_email, r.name as role_name
        FROM staff_attendance sa
        JOIN users u ON sa.staff_user_id = u.id
        JOIN roles r ON u.role_id = r.id
        WHERE sa.school_id = :school_id AND sa.attendance_date = :att_date
        ORDER BY u.name ASC
    ");
    $attStmt->execute([
        ':school_id' => $schoolId,
        ':att_date'  => $date,
    ]);
    $attendanceRecords = $attStmt->fetchAll();

    // Leaves List
    $leaveStmt = $pdo->prepare("
        SELECT sl.*, 
               u.name as staff_name, u.email as staff_email, r.name as role_name,
               approver.name as approved_by_name
        FROM staff_leaves sl
        JOIN users u ON sl.staff_user_id = u.id
        JOIN roles r ON u.role_id = r.id
        LEFT JOIN users approver ON sl.approved_by_user_id = approver.id
        WHERE sl.school_id = :school_id
        ORDER BY sl.created_at DESC LIMIT 100
    ");
    $leaveStmt->execute([':school_id' => $schoolId]);
    $leaves = $leaveStmt->fetchAll();

    // Summary calculation
    $presentCount = 0;
    $lateCount = 0;
    $absentCount = 0;
    $onLeaveCount = 0;
    foreach ($attendanceRecords as $att) {
        if ($att['status'] === 'present') $presentCount++;
        elseif ($att['status'] === 'late') $lateCount++;
        elseif ($att['status'] === 'absent') $absentCount++;
        elseif ($att['status'] === 'on_leave' || $att['status'] === 'half_day') $onLeaveCount++;
    }

    jsonResponse(true, 'HR data retrieved.', [
        'date'               => $date,
        'staff_directory'    => $staffMembers,
        'attendance_records' => $attendanceRecords,
        'leaves'             => $leaves,
        'summary'            => [
            'total_staff' => count($staffMembers),
            'present'     => $presentCount,
            'late'        => $lateCount,
            'absent'      => $absentCount,
            'on_leave'    => $onLeaveCount,
        ],
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAuth($pdo, ['superadmin', 'admin', 'principal', 'accountant', 'teacher']);

    $input = getJsonInput();
    $action = $input['action'] ?? 'mark_attendance';

    if ($action === 'mark_attendance') {
        requireAuth($pdo, ['superadmin', 'admin', 'principal']);

        $staffUserId = (int)($input['staff_user_id'] ?? 0);
        $attDate     = trim((string)($input['attendance_date'] ?? date('Y-m-d')));
        $status      = in_array($input['status'] ?? '', ['present', 'absent', 'late', 'half_day', 'on_leave'], true) ? $input['status'] : 'present';
        $inTime      = !empty($input['in_time']) ? trim((string)$input['in_time']) : ($status === 'present' || $status === 'late' ? '08:50:00' : null);
        $outTime     = !empty($input['out_time']) ? trim((string)$input['out_time']) : ($status === 'present' ? '16:30:00' : null);
        $remarks     = trim((string)($input['remarks'] ?? ''));

        if ($staffUserId <= 0) {
            jsonResponse(false, 'Valid staff user ID is required.', null, 400);
        }

        $stmt = $pdo->prepare("
            INSERT INTO staff_attendance (school_id, branch_id, staff_user_id, attendance_date, status, in_time, out_time, remarks)
            VALUES (:school_id, :branch_id, :staff_user_id, :att_date, :status, :in_time, :out_time, :remarks)
            ON DUPLICATE KEY UPDATE 
                status = VALUES(status), 
                in_time = VALUES(in_time), 
                out_time = VALUES(out_time), 
                remarks = VALUES(remarks)
        ");
        $stmt->execute([
            ':school_id'     => $schoolId,
            ':branch_id'     => $branchId,
            ':staff_user_id' => $staffUserId,
            ':att_date'      => $attDate,
            ':status'        => $status,
            ':in_time'       => $inTime,
            ':out_time'      => $outTime,
            ':remarks'       => $remarks,
        ]);

        jsonResponse(true, "Staff attendance marked successfully ($status).");
    }

    if ($action === 'apply_leave') {
        $staffUserId = !empty($input['staff_user_id']) ? (int)$input['staff_user_id'] : (int)$user['id'];
        $leaveType   = in_array($input['leave_type'] ?? '', ['casual', 'sick', 'maternity', 'earned'], true) ? $input['leave_type'] : 'casual';
        $fromDate    = trim((string)($input['from_date'] ?? date('Y-m-d')));
        $toDate      = trim((string)($input['to_date'] ?? date('Y-m-d')));
        $daysCount   = max(1, (int)($input['days_count'] ?? 1));
        $reason      = trim((string)($input['reason'] ?? ''));

        if (empty($reason)) {
            jsonResponse(false, 'Reason for leave application is required.', null, 400);
        }

        $stmt = $pdo->prepare("
            INSERT INTO staff_leaves (school_id, branch_id, staff_user_id, leave_type, from_date, to_date, days_count, reason, status)
            VALUES (:school_id, :branch_id, :staff_user_id, :leave_type, :from_date, :to_date, :days_count, :reason, 'pending')
        ");
        $stmt->execute([
            ':school_id'     => $schoolId,
            ':branch_id'     => $branchId,
            ':staff_user_id' => $staffUserId,
            ':leave_type'    => $leaveType,
            ':from_date'     => $fromDate,
            ':to_date'       => $toDate,
            ':days_count'    => $daysCount,
            ':reason'        => $reason,
        ]);

        jsonResponse(true, 'Leave application submitted successfully (Pending approval).', [
            'leave_id' => (int)$pdo->lastInsertId(),
        ]);
    }

    if ($action === 'update_leave_status') {
        requireAuth($pdo, ['superadmin', 'admin', 'principal']);

        $leaveId       = (int)($input['leave_id'] ?? 0);
        $decisionStatus = in_array($input['status'] ?? '', ['approved', 'rejected'], true) ? $input['status'] : 'approved';
        $decisionNotes = trim((string)($input['decision_notes'] ?? ''));

        if ($leaveId <= 0) {
            jsonResponse(false, 'Valid leave ID is required.', null, 400);
        }

        $stmt = $pdo->prepare("
            UPDATE staff_leaves 
            SET status = :status, approved_by_user_id = :approver, decision_notes = :notes
            WHERE id = :id AND school_id = :school_id
        ");
        $stmt->execute([
            ':status'    => $decisionStatus,
            ':approver'  => (int)$user['id'],
            ':notes'     => $decisionNotes,
            ':id'        => $leaveId,
            ':school_id' => $schoolId,
        ]);

        jsonResponse(true, "Leave application has been {$decisionStatus}.");
    }

    if ($action === 'create_staff') {
        requireAuth($pdo, ['superadmin', 'admin', 'principal']);

        $name     = trim((string)($input['name'] ?? ''));
        $email    = trim((string)($input['email'] ?? ''));
        $phone    = trim((string)($input['phone'] ?? ''));
        $roleName = trim((string)($input['role_name'] ?? 'teacher'));
        $password = !empty($input['password']) ? (string)$input['password'] : 'Teacher@123';

        if (empty($name) || empty($email)) {
            jsonResponse(false, 'Staff name and email are required.', null, 400);
        }

        // Get role_id
        $roleStmt = $pdo->prepare("SELECT id FROM roles WHERE name = :r OR slug = :s LIMIT 1");
        $roleStmt->execute([':r' => $roleName, ':s' => $roleName]);
        $roleId = (int)$roleStmt->fetchColumn();
        if (!$roleId) {
            $roleId = 4; // default teacher
        }

        // Generate unique username to satisfy users.username NOT NULL UNIQUE constraint
        $baseUser = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', explode('@', $email)[0]));
        if (empty($baseUser)) {
            $baseUser = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $name));
        }
        if (empty($baseUser)) {
            $baseUser = 'staff';
        }
        $username = $baseUser;
        $counter = 1;
        while (true) {
            $uChk = $pdo->prepare("SELECT id FROM users WHERE username = :u AND school_id = :school_id LIMIT 1");
            $uChk->execute([':u' => $username, ':school_id' => $schoolId]);
            if (!$uChk->fetch()) {
                break;
            }
            $username = $baseUser . $counter;
            $counter++;
        }

        $passwordHash = password_hash($password, PASSWORD_BCRYPT);

        try {
            $stmt = $pdo->prepare("
                INSERT INTO users (school_id, branch_id, role_id, username, name, email, phone, password_hash, status)
                VALUES (:school_id, :branch_id, :role_id, :username, :name, :email, :phone, :hash, 'active')
            ");
            $stmt->execute([
                ':school_id' => $schoolId,
                ':branch_id' => $branchId,
                ':role_id'   => $roleId,
                ':username'  => $username,
                ':name'      => $name,
                ':email'     => $email,
                ':phone'     => $phone,
                ':hash'      => $passwordHash,
            ]);

            $newStaffId = (int)$pdo->lastInsertId();

            jsonResponse(true, "Staff member {$name} registered successfully with username '{$username}'.", [
                'staff_id' => $newStaffId,
                'username' => $username,
            ]);
        } catch (PDOException $e) {
            jsonResponse(false, 'Database error while saving staff: ' . $e->getMessage(), null, 500);
        }
    }

    if ($action === 'update_staff') {
        requireAuth($pdo, ['superadmin', 'admin', 'principal']);

        $staffId  = (int)($input['id'] ?? 0);
        $name     = trim((string)($input['name'] ?? ''));
        $email    = trim((string)($input['email'] ?? ''));
        $phone    = trim((string)($input['phone'] ?? ''));
        $roleName = trim((string)($input['role_name'] ?? ''));
        $status   = in_array($input['status'] ?? '', ['active', 'inactive', 'suspended'], true) ? $input['status'] : 'active';

        if ($staffId <= 0 || empty($name)) {
            jsonResponse(false, 'Valid staff ID and name are required.', null, 400);
        }

        // Get role_id if provided
        $roleId = null;
        if (!empty($roleName)) {
            $roleStmt = $pdo->prepare("SELECT id FROM roles WHERE name = :r LIMIT 1");
            $roleStmt->execute([':r' => $roleName]);
            $roleId = (int)$roleStmt->fetchColumn() ?: null;
        }

        try {
            if ($roleId) {
                $stmt = $pdo->prepare("
                    UPDATE users 
                    SET name = :name, email = :email, phone = :phone, role_id = :role_id, status = :status
                    WHERE id = :id AND school_id = :school_id
                ");
                $stmt->execute([
                    ':name'      => $name,
                    ':email'     => $email,
                    ':phone'     => $phone,
                    ':role_id'   => $roleId,
                    ':status'    => $status,
                    ':id'        => $staffId,
                    ':school_id' => $schoolId,
                ]);
            } else {
                $stmt = $pdo->prepare("
                    UPDATE users 
                    SET name = :name, email = :email, phone = :phone, status = :status
                    WHERE id = :id AND school_id = :school_id
                ");
                $stmt->execute([
                    ':name'      => $name,
                    ':email'     => $email,
                    ':phone'     => $phone,
                    ':status'    => $status,
                    ':id'        => $staffId,
                    ':school_id' => $schoolId,
                ]);
            }

            jsonResponse(true, "Staff record for {$name} updated successfully.");
        } catch (PDOException $e) {
            jsonResponse(false, 'Database error while updating staff: ' . $e->getMessage(), null, 500);
        }
    }

    jsonResponse(false, 'Invalid action specified.', null, 400);
}

