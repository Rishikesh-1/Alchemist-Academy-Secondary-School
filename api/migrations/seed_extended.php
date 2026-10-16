<?php
// api/migrations/seed_extended.php
// Seeds initial demonstration records for the extended SMS modules
declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';

header('Content-Type: text/plain; charset=utf-8');

echo "========================================================\n";
echo " SEEDING EXTENDED SMS MODULES DATA\n";
echo "========================================================\n\n";

try {
    $pdo->beginTransaction();

    // 1. Front Office Visitors
    echo "[1/8] Seeding Front Office Visitors... ";
    $visitors = [
        [1, 1, 'Deepak KC', '9841556677', 'Citizenship', '27-01-72-01928', 'Admission inquiry for daughter in Grade 11 Science', 'Admissions Counselor', date('Y-m-d 09:30:00'), date('Y-m-d 10:15:00'), 'VP-2026-101', 'checked_out'],
        [1, 1, 'Rita Shrestha', '9851088990', 'Driving License', 'DL-882910', 'Fee query and receipt verification', 'Bursar Desk', date('Y-m-d 10:45:00'), null, 'VP-2026-102', 'checked_in'],
        [1, 2, 'Kiran Adhikari', '9813223344', 'National ID', 'NID-991823', 'Parent-Teacher counseling session', 'Dr. Saroj Karki', date('Y-m-d 11:15:00'), null, 'VP-2026-103', 'checked_in'],
    ];
    $stmt = $pdo->prepare("
        INSERT INTO front_office_visitors 
        (school_id, branch_id, visitor_name, phone, id_card_type, id_card_number, purpose, person_to_meet, check_in_time, check_out_time, pass_no, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE status = VALUES(status)
    ");
    foreach ($visitors as $v) $stmt->execute($v);

    // Front office calls
    $calls = [
        [1, 1, 'Bishnu Thapa', '9841001122', 'incoming', date('Y-m-d'), 4, 'Inquired about hostel accommodations and fees for Grade 9', date('Y-m-d', strtotime('+3 days'))],
        [1, 1, 'School Bus Vendor', '9851099221', 'outgoing', date('Y-m-d'), 6, 'Confirmed maintenance inspection for Transit Bus #3', null],
    ];
    $cStmt = $pdo->prepare("
        INSERT INTO front_office_calls 
        (school_id, branch_id, caller_name, phone, call_type, call_date, duration_minutes, description, next_follow_up_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    foreach ($calls as $c) $cStmt->execute($c);
    echo "DONE\n";

    // 2. Online Courses & Live Virtual Classes
    echo "[2/8] Seeding E-Learning Courses & Virtual Classes... ";
    $courses = [
        [1, 1, 1, 4, 4, 'Advanced Thermodynamics & Mechanics Masterclass', 'Comprehensive SEE Science physics modules with animated simulations and problem sets.', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80', 16, 'published'],
        [1, 1, 1, 3, 4, 'Coordinate Geometry & Trigonometric Proofs', 'Interactive mastery sessions on Euclidean theorems, circle angles, and vector algebra.', 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80', 12, 'published'],
    ];
    $courseStmt = $pdo->prepare("
        INSERT INTO online_courses (school_id, branch_id, class_id, subject_id, teacher_id, title, description, thumbnail_url, total_lessons, course_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    foreach ($courses as $co) $courseStmt->execute($co);

    $liveClasses = [
        [1, 1, 1, 4, 4, 'Live Revision: Chemical Bonding & Redox Reactions', 'zoom', '891-2234-9981', 'Chem2026', 'https://zoom.us/j/89122349981', date('Y-m-d 15:00:00'), 45, 'scheduled'],
        [1, 1, 1, 1, 4, 'Interactive English Debate: Climate Resilience in the Himalayas', 'google_meet', 'meet-nep-2026', 'None', 'https://meet.google.com/abc-defg-hij', date('Y-m-d 16:30:00'), 40, 'scheduled'],
    ];
    $liveStmt = $pdo->prepare("
        INSERT INTO online_live_classes (school_id, branch_id, class_id, subject_id, teacher_id, title, platform, meeting_id, meeting_password, join_url, start_time, duration_minutes, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    foreach ($liveClasses as $lc) $liveStmt->execute($lc);
    echo "DONE\n";

    // 3. Student Behavior Records
    echo "[3/8] Seeding Student Behavior & Conduct Tracking... ";
    $behaviors = [
        [1, 1, 1, 'positive', 'National Science Olympiad Runner-up', 15, 'Awarded silver medal at national youth science expo for automated earthquake sensor project.', 'Commendation Letter Issued', 4, date('Y-m-d', strtotime('-5 days')), 1],
        [1, 1, 1, 'positive', 'Peer Tutoring Excellence in Mathematics', 10, 'Consistently dedicated study breaks to mentor junior grade students.', 'Peer Mentor Badge', 4, date('Y-m-d', strtotime('-2 days')), 0],
        [1, 1, 2, 'disciplinary', 'Mobile Device Possession in Classroom', -5, 'Phone ring tone interrupted 3rd period lecture without teacher authorization.', 'Phone deposited with coordinator for 48 hours', 4, date('Y-m-d', strtotime('-1 day')), 1],
    ];
    $bStmt = $pdo->prepare("
        INSERT INTO student_behavior_records (school_id, branch_id, student_id, incident_type, title, points, description, action_taken, reported_by_user_id, incident_date, guardian_notified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    foreach ($behaviors as $b) $bStmt->execute($b);
    echo "DONE\n";

    // 4. Financial Expenses & Cashflow
    echo "[4/8] Seeding Financial Expenses & Operational Ledger... ";
    $expenses = [
        [1, 1, 'NEA Electricity Bill - September 2026', 'utilities', 48500.00, 'bank_transfer', 'NEA-TXN-99812', date('Y-m-d', strtotime('-10 days')), 'Three-phase dedicated campus transformer connection', 5],
        [1, 1, 'High-Speed Fiber Internet Leased Line (100 Mbps)', 'utilities', 16000.00, 'bank_transfer', 'CG-NET-44910', date('Y-m-d', strtotime('-8 days')), 'Dual backup for computer lab and administrative ERP', 5],
        [1, 1, 'Chemistry Lab Reagents & Glassware Restock', 'academic', 28900.00, 'cheque', 'CHQ-881920', date('Y-m-d', strtotime('-6 days')), 'Titration acids, burettes, and safety goggles', 5],
        [1, 1, 'Athletic Track Maintenance & Football Turf Grass Cut', 'maintenance', 14500.00, 'cash', 'VCH-CASH-101', date('Y-m-d', strtotime('-3 days')), 'Pre-sports meet turf leveling and line chalking', 5],
        [1, 2, 'Bouddha Junior Campus Stationery & Art Papers', 'supplies', 12300.00, 'cash', 'VCH-CASH-102', date('Y-m-d', strtotime('-2 days')), 'Drawing charts and water-color sets', 5],
    ];
    $expStmt = $pdo->prepare("
        INSERT INTO financial_expenses (school_id, branch_id, title, category, amount, payment_mode, reference_no, expense_date, notes, created_by_user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    foreach ($expenses as $e) $expStmt->execute($e);
    echo "DONE\n";

    // 5. Multi-System Examinations & Online CBT Assessments
    echo "[5/8] Seeding Multi-System Exams (CBSE, Standard & Online CBT)... ";
    $questionsSample = json_encode([
        [
            'id' => 1,
            'question' => 'Which cell organelle is known as the powerhouse of the cell?',
            'options' => ['Ribosome', 'Mitochondria', 'Golgi Body', 'Endoplasmic Reticulum'],
            'correct_index' => 1,
            'marks' => 2,
        ],
        [
            'id' => 2,
            'question' => 'What is the SI unit of gravitational acceleration (g)?',
            'options' => ['m/s', 'm/s²', 'N/kg²', 'Joule'],
            'correct_index' => 1,
            'marks' => 2,
        ],
        [
            'id' => 3,
            'question' => 'Which element has the atomic number 17 on the periodic table?',
            'options' => ['Oxygen', 'Chlorine', 'Sodium', 'Sulfur'],
            'correct_index' => 1,
            'marks' => 2,
        ],
    ]);

    $assessments = [
        [1, 1, 1, 4, 'online_quiz', 'SEE Science Quick Assessment: Cell Biology & Mechanics', 30, 45, 12, date('Y-m-d 10:00:00'), date('Y-m-d 23:59:59'), $questionsSample, 'published'],
        [1, 1, 1, 3, 'cbse', 'CBSE / International Standardized Mathematics Pre-Test', 50, 90, 20, date('Y-m-d 14:00:00', strtotime('+2 days')), date('Y-m-d 16:00:00', strtotime('+2 days')), $questionsSample, 'published'],
    ];
    $oaStmt = $pdo->prepare("
        INSERT INTO online_assessments (school_id, branch_id, class_id, subject_id, exam_system, title, total_marks, duration_minutes, pass_marks, start_time, end_time, questions_json, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    foreach ($assessments as $oa) $oaStmt->execute($oa);
    echo "DONE\n";

    // 6. Staff Daily Attendance & Leave Management
    echo "[6/8] Seeding Staff Daily Attendance & Leave Records... ";
    $staffAtt = [
        [1, 1, 3, date('Y-m-d'), 'present', '08:45:00', '16:30:00', 'Principal Morning Assembly Address'],
        [1, 1, 4, date('Y-m-d'), 'present', '08:52:00', '16:15:00', 'On duty on time'],
        [1, 1, 5, date('Y-m-d'), 'present', '08:50:00', '16:30:00', 'Accounts desk open'],
        [1, 1, 6, date('Y-m-d'), 'late', '09:18:00', '16:00:00', 'Public transport traffic delay at Chabahil'],
    ];
    $saStmt = $pdo->prepare("
        INSERT INTO staff_attendance (school_id, branch_id, staff_user_id, attendance_date, status, in_time, out_time, remarks)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE status = VALUES(status), in_time = VALUES(in_time), out_time = VALUES(out_time)
    ");
    foreach ($staffAtt as $sa) $saStmt->execute($sa);

    $leaves = [
        [1, 1, 6, 'casual', date('Y-m-d', strtotime('+3 days')), date('Y-m-d', strtotime('+4 days')), 2, 'Family religious ceremony in Pokhara', 'approved', 3, 'Approved. Alternate librarian to cover morning shifts.'],
        [1, 1, 4, 'sick', date('Y-m-d', strtotime('+7 days')), date('Y-m-d', strtotime('+7 days')), 1, 'Dental appointment and root canal procedure', 'pending', null, null],
    ];
    $slStmt = $pdo->prepare("
        INSERT INTO staff_leaves (school_id, branch_id, staff_user_id, leave_type, from_date, to_date, days_count, reason, status, approved_by_user_id, decision_notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    foreach ($leaves as $sl) $slStmt->execute($sl);
    echo "DONE\n";

    // 7. Academics & Lesson Plans
    echo "[7/8] Seeding Lesson Plans & Curriculum Syllabus Tracking... ";
    $plans = [
        [1, 1, 1, 4, 4, 1, 'Unit 1: Force and Gravity', 'Newton Laws of Gravitation & Free Fall Calculations', 'Deduce gravitational equation F = G(m1*m2)/d^2 and solve numerical problems.', 'Interactive Digital Whiteboard & PhET Simulation', date('Y-m-d'), 'completed', 100],
        [1, 1, 1, 4, 4, 2, 'Unit 2: Pressure in Fluids', 'Atmospheric Pressure, Hydraulic Lift & Pascal Principle', 'Demonstrate hydraulic brake model and solve U-tube manometer exercises.', 'Hands-on Lab Experiment with Pascal Syringes', date('Y-m-d', strtotime('+2 days')), 'in_progress', 65],
        [1, 1, 1, 3, 4, 1, 'Unit 1: Quadratic Equations', 'Standard form, factorization & discriminant properties', 'Identify real, equal, and imaginary roots from b^2 - 4ac.', 'Group Problem-Solving & Kahoot Quiz', date('Y-m-d', strtotime('+4 days')), 'planned', 20],
    ];
    $lpStmt = $pdo->prepare("
        INSERT INTO lesson_plans (school_id, branch_id, class_id, subject_id, teacher_id, week_no, unit_name, topic_title, learning_objectives, teaching_method, planned_date, completion_status, completion_percentage)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    foreach ($plans as $lp) $lpStmt->execute($lp);
    echo "DONE\n";

    // 8. Communication Notices & Internal Circulars
    echo "[8/8] Seeding Communication Circulars & Digital Notice Board... ";
    $notices = [
        [1, 1, 'Grand Annual Athletic Meet 2026 - Event Schedule', 'The Inter-House Track & Field Meet 2026 will be held next Friday at Dasharath Stadium annex ground. All house captains must submit participant lists by Wednesday 4 PM.', 'all', 'high', 1, date('Y-m-d'), 'https://alchemist.edu.np/notices/sports-meet-2026.pdf', 3],
        [1, 1, 'Urgent: Dashain & Tihar Vacation Timetable Notice', 'The school will observe festive recess starting next week. Homework revision packets have been synced to the digital student portal.', 'parents', 'normal', 1, date('Y-m-d', strtotime('-3 days')), null, 3],
        [1, 1, 'Faculty Academic Staff Meeting: First Term CDC Evaluation', 'All department heads and teaching faculty are requested to attend the term review meeting in the Seminar Hall tomorrow at 3:30 PM.', 'teachers', 'urgent', 1, date('Y-m-d', strtotime('-1 day')), null, 3],
    ];
    $cnStmt = $pdo->prepare("
        INSERT INTO communication_notices (school_id, branch_id, title, content, audience, priority, is_published, publish_date, attachment_url, created_by_user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    foreach ($notices as $cn) $cnStmt->execute($cn);
    echo "DONE\n";

    $pdo->commit();

    echo "\n========================================================\n";
    echo " ALL EXTENDED SMS MODULES SEEDED SUCCESSFULLY!\n";
    echo "========================================================\n";

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo "\n[ERROR] Seeding failed: " . $e->getMessage() . "\n";
    exit(1);
}

