<?php
// api/fees/defaulters.php
// Fee defaulter reporting, aging buckets (30/60/90+ days), and reminder dispatcher
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth_guard.php';

$user = requireAuth($pdo);
$schoolId = (int)$user['school_id'];
$branchId = !empty($_GET['branch_id']) ? (int)$_GET['branch_id'] : ($user['branch_id'] ? (int)$user['branch_id'] : null);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Fetch fee defaulters (invoices with status unpaid/partial and due_date in the past)
    $sql = "
        SELECT 
            fi.*,
            s.first_name,
            s.last_name,
            s.admission_no,
            s.roll_no,
            s.guardian_name,
            s.guardian_phone,
            s.guardian_email,
            c.name as class_name,
            DATEDIFF(CURDATE(), fi.due_date) as overdue_days,
            (fi.net_payable - fi.paid_amount) as outstanding_balance
        FROM fee_invoices fi
        JOIN students s ON fi.student_id = s.id
        LEFT JOIN classes c ON s.class_id = c.id
        WHERE fi.school_id = :school_id 
          AND fi.status IN ('unpaid', 'partial')
          AND fi.due_date < CURDATE()
    ";
    $params = [':school_id' => $schoolId];

    if ($branchId) {
        $sql .= " AND (fi.branch_id = :branch_id OR fi.branch_id IS NULL)";
        $params[':branch_id'] = $branchId;
    }

    $sql .= " ORDER BY fi.due_date ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $defaulters = $stmt->fetchAll();

    // Group by aging buckets
    $aging = [
        'under_30' => [],
        'days_30_60' => [],
        'days_60_90' => [],
        'over_90' => [],
    ];

    $totalOutstanding = 0;

    foreach ($defaulters as &$d) {
        $days = (int)$d['overdue_days'];
        $bal = (float)$d['outstanding_balance'];
        $totalOutstanding += $bal;

        if ($days <= 30) {
            $aging['under_30'][] = $d;
        } elseif ($days <= 60) {
            $aging['days_30_60'][] = $d;
        } elseif ($days <= 90) {
            $aging['days_60_90'][] = $d;
        } else {
            $aging['over_90'][] = $d;
        }
    }
    unset($d);

    jsonResponse(true, 'Fee defaulters report retrieved.', [
        'total_defaulters'   => count($defaulters),
        'total_outstanding'  => $totalOutstanding,
        'aging'              => [
            'under_30_count'   => count($aging['under_30']),
            'days_30_60_count' => count($aging['days_30_60']),
            'days_60_90_count' => count($aging['days_60_90']),
            'over_90_count'    => count($aging['over_90']),
        ],
        'defaulters'         => $defaulters,
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAuth($pdo, ['superadmin', 'admin', 'principal', 'accountant']);

    $input = getJsonInput();
    $invoiceIds = $input['invoice_ids'] ?? [];
    $channel = trim((string)($input['channel'] ?? 'sms')); // sms, email, in_app

    if (!is_array($invoiceIds) || empty($invoiceIds)) {
        jsonResponse(false, 'Please provide invoice_ids array to dispatch reminders.', null, 400);
    }

    $invStmt = $pdo->prepare("
        SELECT fi.*, s.first_name, s.last_name, s.guardian_name, s.guardian_phone, s.guardian_email,
               (fi.net_payable - fi.paid_amount) as outstanding
        FROM fee_invoices fi
        JOIN students s ON fi.student_id = s.id
        WHERE fi.id = :id AND fi.school_id = :school_id
    ");

    $insertRem = $pdo->prepare("
        INSERT INTO fee_due_reminders 
        (school_id, invoice_id, student_id, reminder_type, reminder_date, recipient_phone, message_text, status)
        VALUES 
        (:school_id, :inv_id, :st_id, :channel, CURDATE(), :phone, :msg, 'sent')
    ");

    $insertNotif = $pdo->prepare("
        INSERT INTO notifications 
        (school_id, branch_id, title, message, channel, target_role, status)
        VALUES 
        (:school_id, :branch_id, :title, :msg, :channel, 'parent', 'sent')
    ");

    $pdo->beginTransaction();
    $sentCount = 0;

    try {
        foreach ($invoiceIds as $invId) {
            $invStmt->execute([':id' => (int)$invId, ':school_id' => $schoolId]);
            $inv = $invStmt->fetch();
            if (!$inv) continue;

            $outstanding = (float)$inv['outstanding'];
            $guardianPhone = $inv['guardian_phone'] ?: 'N/A';
            $msg = "Dear Guardian, fee payment of NPR " . number_format($outstanding, 2) . " for student {$inv['first_name']} {$inv['last_name']} (Invoice: {$inv['invoice_no']}) is past due date ({$inv['due_date']}). Please clear dues at cashier desk to prevent late fines.";

            $insertRem->execute([
                ':school_id' => $schoolId,
                ':inv_id'    => (int)$inv['id'],
                ':st_id'     => (int)$inv['student_id'],
                ':channel'   => $channel,
                ':phone'     => $guardianPhone,
                ':msg'       => $msg,
            ]);

            $insertNotif->execute([
                ':school_id' => $schoolId,
                ':branch_id' => $branchId,
                ':title'     => "Fee Payment Reminder: {$inv['first_name']}",
                ':msg'       => $msg,
                ':channel'   => $channel,
            ]);

            $sentCount++;
        }

        $pdo->commit();

        logAuditAction(
            $pdo,
            $schoolId,
            $branchId,
            (int)$user['id'],
            $user['name'],
            $user['role_slug'],
            'FEE_REMINDERS_DISPATCH',
            'fee_due_reminders',
            (string)$sentCount,
            null,
            ['reminders_count' => $sentCount, 'channel' => $channel]
        );

        jsonResponse(true, "Fee due reminders successfully sent to {$sentCount} guardians.", [
            'sent_count' => $sentCount,
            'channel'    => $channel,
        ]);

    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        jsonResponse(false, 'Failed to send reminders: ' . $e->getMessage(), null, 500);
    }
}

jsonResponse(false, 'Method not allowed.', null, 405);

