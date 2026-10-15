<?php
// api/operations/transport.php
// Transport fleet, bus transit routes, vehicle tracking, and student pickup stops
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth_guard.php';

$user = requireAuth($pdo);
$schoolId = (int)$user['school_id'];
$branchId = !empty($_GET['branch_id']) ? (int)$_GET['branch_id'] : ($user['branch_id'] ? (int)$user['branch_id'] : 1);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // 1. Vehicles
    $vehStmt = $pdo->prepare("SELECT * FROM transport_vehicles WHERE school_id = :school_id ORDER BY id ASC");
    $vehStmt->execute([':school_id' => $schoolId]);
    $vehicles = $vehStmt->fetchAll();

    // 2. Routes with vehicle details
    $routesStmt = $pdo->prepare("
        SELECT 
            tr.*,
            tv.vehicle_no,
            tv.driver_name,
            tv.driver_phone
        FROM transport_routes tr
        LEFT JOIN transport_vehicles tv ON tr.vehicle_id = tv.id
        WHERE tr.school_id = :school_id
        ORDER BY tr.route_name ASC
    ");
    $routesStmt->execute([':school_id' => $schoolId]);
    $routes = $routesStmt->fetchAll();

    foreach ($routes as &$r) {
        $r['stops'] = !empty($r['stops']) ? json_decode($r['stops'], true) : [];
    }
    unset($r);

    jsonResponse(true, 'Transport fleet and routes retrieved.', [
        'vehicles' => $vehicles,
        'routes'   => $routes,
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAuth($pdo, ['superadmin', 'admin', 'principal']);

    $input = getJsonInput();
    $action = $input['action'] ?? 'add_route';

    if ($action === 'add_vehicle') {
        $vehicleNo = trim((string)($input['vehicle_no'] ?? ''));
        $capacity = (int)($input['capacity'] ?? 30);
        $driverName = trim((string)($input['driver_name'] ?? ''));
        $driverPhone = trim((string)($input['driver_phone'] ?? ''));

        if (empty($vehicleNo)) {
            jsonResponse(false, 'vehicle_no is required.', null, 400);
        }

        $ins = $pdo->prepare("
            INSERT INTO transport_vehicles (school_id, branch_id, vehicle_no, capacity, driver_name, driver_phone, status)
            VALUES (:s, :b, :v, :c, :dn, :dp, 'active')
        ");
        $ins->execute([
            ':s'  => $schoolId,
            ':b'  => $branchId,
            ':v'  => $vehicleNo,
            ':c'  => $capacity,
            ':dn' => $driverName,
            ':dp' => $driverPhone,
        ]);

        jsonResponse(true, "Vehicle {$vehicleNo} added successfully.", ['id' => (int)$pdo->lastInsertId()]);
    }

    if ($action === 'add_route') {
        $routeName = trim((string)($input['route_name'] ?? ''));
        $vehicleId = !empty($input['vehicle_id']) ? (int)$input['vehicle_id'] : null;
        $monthlyFare = (float)($input['monthly_fare'] ?? 2500);
        $stops = $input['stops'] ?? [];

        if (empty($routeName)) {
            jsonResponse(false, 'route_name is required.', null, 400);
        }

        $ins = $pdo->prepare("
            INSERT INTO transport_routes (school_id, branch_id, route_name, vehicle_id, stops, monthly_fare, status)
            VALUES (:s, :b, :rn, :vid, :stops, :fare, 'active')
        ");
        $ins->execute([
            ':s'     => $schoolId,
            ':b'     => $branchId,
            ':rn'    => $routeName,
            ':vid'   => $vehicleId,
            ':stops' => json_encode($stops),
            ':fare'  => $monthlyFare,
        ]);

        jsonResponse(true, "Route {$routeName} added successfully.", ['id' => (int)$pdo->lastInsertId()]);
    }
}

jsonResponse(false, 'Method not allowed.', null, 405);
