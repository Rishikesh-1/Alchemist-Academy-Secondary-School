<?php
// api/front_office/index.php
// Front Office Management: Visitors pass, phone call logs, and front-desk inquiries
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth_guard.php';

$user = requireAuth($pdo);
$schoolId = (int)$user['school_id'];
$branchId = !empty($_GET['branch_id']) ? (int)$_GET['branch_id'] : ($user['branch_id'] ? (int)$user['branch_id'] : 1);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $type = trim((string)($_GET['type'] ?? 'visitors')); // 'visitors' | 'calls'

    if ($type === 'calls') {
        $stmt = $pdo->prepare("
            SELECT * FROM front_office_calls 
            WHERE school_id = :school_id
            ORDER BY call_date DESC, id DESC LIMIT 100
        ");
        $stmt->execute([':school_id' => $schoolId]);
        $calls = $stmt->fetchAll();

        jsonResponse(true, 'Front office call logs retrieved.', [
            'calls' => $calls,
            'count' => count($calls),
        ]);
    }

    // Default: Visitors
    $stmt = $pdo->prepare("
        SELECT * FROM front_office_visitors 
        WHERE school_id = :school_id 
        ORDER BY check_in_time DESC LIMIT 100
    ");
    $stmt->execute([':school_id' => $schoolId]);
    $visitors = $stmt->fetchAll();

    jsonResponse(true, 'Front office visitors retrieved.', [
        'visitors' => $visitors,
        'count'    => count($visitors),
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAuth($pdo, ['superadmin', 'admin', 'principal', 'admissions', 'academic']);

    $input = getJsonInput();
    $action = $input['action'] ?? 'add_visitor';

    if ($action === 'add_visitor') {
        $visitorName  = trim((string)($input['visitor_name'] ?? ''));
        $phone        = trim((string)($input['phone'] ?? ''));
        $purpose      = trim((string)($input['purpose'] ?? 'General Inquiry'));
        $personToMeet = trim((string)($input['person_to_meet'] ?? 'Administration'));
        $idCardType   = trim((string)($input['id_card_type'] ?? 'Citizenship'));
        $idCardNumber = trim((string)($input['id_card_number'] ?? ''));

        if (empty($visitorName) || empty($phone)) {
            jsonResponse(false, 'Visitor name and contact phone are required.', null, 400);
        }

        $passNo = 'VP-' . date('Y') . '-' . str_pad((string)rand(100, 9999), 4, '0', STR_PAD_LEFT);

        $stmt = $pdo->prepare("
            INSERT INTO front_office_visitors 
            (school_id, branch_id, visitor_name, phone, id_card_type, id_card_number, purpose, person_to_meet, check_in_time, pass_no, status)
            VALUES (:s, :b, :vn, :p, :idt, :idn, :pur, :ptm, NOW(), :pass, 'checked_in')
        ");
        $stmt->execute([
            ':s'    => $schoolId,
            ':b'    => $branchId,
            ':vn'   => $visitorName,
            ':p'    => $phone,
            ':idt'  => $idCardType,
            ':idn'  => $idCardNumber,
            ':pur'  => $purpose,
            ':ptm'  => $personToMeet,
            ':pass' => $passNo,
        ]);

        $visitorId = (int)$pdo->lastInsertId();

        logAuditAction(
            $pdo,
            $schoolId,
            $branchId,
            (int)$user['id'],
            $user['name'],
            $user['role_slug'],
            'VISITOR_CHECK_IN',
            'front_office_visitors',
            $passNo,
            null,
            ['visitor_name' => $visitorName, 'pass_no' => $passNo, 'purpose' => $purpose]
        );

        jsonResponse(true, "Visitor pass {$passNo} generated for {$visitorName}.", [
            'visitor_id' => $visitorId,
            'pass_no'    => $passNo,
            'check_in'   => date('Y-m-d H:i:s'),
        ]);
    }

    if ($action === 'checkout_visitor') {
        $visitorId = (int)($input['visitor_id'] ?? 0);
        $passNo    = trim((string)($input['pass_no'] ?? ''));

        if (!$visitorId && empty($passNo)) {
            jsonResponse(false, 'visitor_id or pass_no is required.', null, 400);
        }

        if ($visitorId > 0) {
            $stmt = $pdo->prepare("
                UPDATE front_office_visitors 
                SET check_out_time = NOW(), status = 'checked_out' 
                WHERE id = :id AND school_id = :s
            ");
            $stmt->execute([':id' => $visitorId, ':s' => $schoolId]);
        } else {
            $stmt = $pdo->prepare("
                UPDATE front_office_visitors 
                SET check_out_time = NOW(), status = 'checked_out' 
                WHERE pass_no = :pass AND school_id = :s
            ");
            $stmt->execute([':pass' => $passNo, ':s' => $schoolId]);
        }

        jsonResponse(true, 'Visitor checked out successfully.');
    }

    if ($action === 'log_call') {
        $callerName  = trim((string)($input['caller_name'] ?? ''));
        $phone       = trim((string)($input['phone'] ?? ''));
        $callType    = in_array($input['call_type'] ?? '', ['incoming', 'outgoing'], true) ? $input['call_type'] : 'incoming';
        $duration    = max(1, (int)($input['duration_minutes'] ?? 5));
        $description = trim((string)($input['description'] ?? ''));
        $followUp    = !empty($input['next_follow_up_date']) ? $input['next_follow_up_date'] : null;

        if (empty($callerName) || empty($phone)) {
            jsonResponse(false, 'Caller name and phone are required.', null, 400);
        }

        $stmt = $pdo->prepare("
            INSERT INTO front_office_calls 
            (school_id, branch_id, caller_name, phone, call_type, call_date, duration_minutes, description, next_follow_up_date)
            VALUES (:s, :b, :cn, :p, :ct, CURDATE(), :d, :desc, :fu)
        ");
        $stmt->execute([
            ':s'    => $schoolId,
            ':b'    => $branchId,
            ':cn'   => $callerName,
            ':p'    => $phone,
            ':ct'   => $callType,
            ':d'    => $duration,
            ':desc' => $description,
            ':fu'   => $followUp,
        ]);

        jsonResponse(true, 'Phone call log recorded successfully.');
    }
}

jsonResponse(false, 'Method not allowed.', null, 405);

