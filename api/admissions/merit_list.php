<?php
// api/admissions/merit_list.php
// Online admissions pipeline, entrance test ranking, and merit list publisher
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth_guard.php';

$user = requireAuth($pdo);
$schoolId = (int)$user['school_id'];
$branchId = !empty($_GET['branch_id']) ? (int)$_GET['branch_id'] : ($user['branch_id'] ? (int)$user['branch_id'] : 1);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $classId = !empty($_GET['class_id']) ? (int)$_GET['class_id'] : null;

    $sql = "
        SELECT 
            aa.*,
            c.name as class_name,
            b.name as branch_name
        FROM admission_applications aa
        LEFT JOIN classes c ON aa.applied_class_id = c.id
        LEFT JOIN branches b ON aa.branch_id = b.id
        WHERE aa.school_id = :school_id
    ";
    $params = [':school_id' => $schoolId];

    if ($branchId) {
        $sql .= " AND (aa.branch_id = :branch_id OR aa.branch_id IS NULL)";
        $params[':branch_id'] = $branchId;
    }

    if ($classId) {
        $sql .= " AND aa.applied_class_id = :class_id";
        $params[':class_id'] = $classId;
    }

    $sql .= " ORDER BY COALESCE(aa.merit_rank, 9999) ASC, aa.entrance_score DESC, aa.id DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $applications = $stmt->fetchAll();

    // Published merit lists
    $mlStmt = $pdo->prepare("
        SELECT ml.*, c.name as class_name, u.name as publisher_name 
        FROM admissions_merit_lists ml
        LEFT JOIN classes c ON ml.class_id = c.id
        LEFT JOIN users u ON ml.published_by_user_id = u.id
        WHERE ml.school_id = :school_id
        ORDER BY ml.id DESC
    ");
    $mlStmt->execute([':school_id' => $schoolId]);
    $meritLists = $mlStmt->fetchAll();

    jsonResponse(true, 'Admissions merit list and applications retrieved.', [
        'applications' => $applications,
        'merit_lists'  => $meritLists,
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAuth($pdo, ['superadmin', 'admin', 'principal', 'admissions']);

    $input = getJsonInput();
    $action = $input['action'] ?? 'publish_merit_list';

    if ($action === 'score_applicant') {
        $appId = (int)($input['application_id'] ?? 0);
        $score = (float)($input['entrance_score'] ?? 0);
        $status = trim((string)($input['status'] ?? 'under_review'));

        if (!$appId) {
            jsonResponse(false, 'application_id is required.', null, 400);
        }

        $stmt = $pdo->prepare("
            UPDATE admission_applications 
            SET entrance_score = :score, status = :st, updated_at = NOW() 
            WHERE id = :id AND school_id = :s
        ");
        $stmt->execute([':score' => $score, ':st' => $status, ':id' => $appId, ':s' => $schoolId]);

        jsonResponse(true, 'Entrance score updated successfully.');
    }

    if ($action === 'publish_merit_list') {
        $title = trim((string)($input['title'] ?? 'General Merit List - Batch 2026'));
        $classId = !empty($input['class_id']) ? (int)$input['class_id'] : null;
        $quota = trim((string)($input['quota'] ?? 'Open Merit'));

        // Rank applicants by entrance_score descending
        $rankStmt = $pdo->prepare("
            SELECT id, applicant_name, entrance_score 
            FROM admission_applications 
            WHERE school_id = :s AND applied_class_id = :c
            ORDER BY entrance_score DESC, id ASC
        ");
        $rankStmt->execute([':s' => $schoolId, ':c' => $classId]);
        $ranked = $rankStmt->fetchAll();

        $updRank = $pdo->prepare("UPDATE admission_applications SET merit_rank = :rank, status = :st WHERE id = :id");
        $cutoff = 0;
        foreach ($ranked as $idx => $r) {
            $rankNum = $idx + 1;
            $newStatus = $rankNum <= 20 ? 'approved' : 'waitlisted';
            $updRank->execute([':rank' => $rankNum, ':st' => $newStatus, ':id' => $r['id']]);
            $cutoff = (float)$r['entrance_score'];
        }

        // Publish to admissions_merit_lists
        $pubStmt = $pdo->prepare("
            INSERT INTO admissions_merit_lists 
            (school_id, branch_id, title, class_id, quota, cutoff_score, published_by_user_id)
            VALUES 
            (:school_id, :branch_id, :title, :class_id, :quota, :cutoff, :pub_by)
        ");
        $pubStmt->execute([
            ':school_id' => $schoolId,
            ':branch_id' => $branchId,
            ':title'     => $title,
            ':class_id'  => $classId,
            ':quota'     => $quota,
            ':cutoff'    => $cutoff,
            ':pub_by'    => (int)$user['id'],
        ]);

        $listId = (int)$pdo->lastInsertId();

        logAuditAction(
            $pdo,
            $schoolId,
            $branchId,
            (int)$user['id'],
            $user['name'],
            $user['role_slug'],
            'MERIT_LIST_PUBLISH',
            'admissions_merit_lists',
            (string)$listId,
            null,
            ['title' => $title, 'class_id' => $classId, 'ranked_count' => count($ranked)]
        );

        jsonResponse(true, "Merit list '{$title}' published for " . count($ranked) . " applicants.", [
            'merit_list_id' => $listId,
            'ranked_count'  => count($ranked),
        ]);
    }
}

jsonResponse(false, 'Method not allowed.', null, 405);
