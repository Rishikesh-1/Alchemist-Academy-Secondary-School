<?php
// api/migrations/seed.php
// Comprehensive seed data option for testing multi-tenant, multi-branch, all 7 roles, and modules
declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';

header('Content-Type: text/plain; charset=utf-8');

echo "========================================================\n";
echo " ALCHEMIST ACADEMY ENTERPRISE SMS - SEED DATA GENERATOR\n";
echo "========================================================\n\n";

try {
    $pdo->beginTransaction();

    // 1. Seed School Tenant (ID = 1)
    echo "[1/12] Seeding Master School Tenant... ";
    $schoolStmt = $pdo->prepare("
        INSERT INTO schools (id, code, name, domain, contact_email, contact_phone, address, plan, subscription_status, subscription_expires_at)
        VALUES (1, 'alchemist', 'Alchemist Academy', 'alchemistacademy.edu.np', 'info@alchemistacademy.edu.np', '01-4915000', 'Jorpati, Gokarneshwor-5, Kathmandu', 'enterprise', 'active', '2028-12-31')
        ON DUPLICATE KEY UPDATE name = VALUES(name), plan = VALUES(plan), subscription_status = VALUES(subscription_status)
    ");
    $schoolStmt->execute();
    echo "DONE\n";

    // 2. Seed Branches (Main Campus & Bouddha Wing)
    echo "[2/12] Seeding Multiple Branches... ";
    $branchStmt = $pdo->prepare("
        INSERT INTO branches (id, school_id, name, code, address, contact_phone, contact_email, principal_name, is_main, status)
        VALUES 
        (1, 1, 'Alchemist Academy Main Campus', 'BR-MAIN', 'Jorpati, Gokarneshwor-5, Kathmandu', '01-4915000', 'main@alchemist.edu.np', 'Dr. Saroj Karki', 1, 'active'),
        (2, 1, 'Bouddha Secondary & Junior Wing', 'BR-BOUDDHA', 'Bouddha Gate Road, Kathmandu', '01-4915002', 'bouddha@alchemist.edu.np', 'Sushila Poudel', 0, 'active')
        ON DUPLICATE KEY UPDATE name = VALUES(name), principal_name = VALUES(principal_name)
    ");
    $branchStmt->execute();
    echo "DONE\n";

    // 3. Seed Users with Secure Hashed Passwords for All 7 Roles
    echo "[3/12] Seeding Secure Users with Bcrypt Hashed Passwords (All 7 Roles)... ";
    
    // Default testing passwords:
    // admin -> Admin@2026
    // principal -> Principal@2026
    // teacher -> Teacher@2026
    // accountant -> Accountant@2026
    // librarian -> Librarian@2026
    // parent -> Parent@2026
    // student -> Student@2026
    // superadmin -> Super@2026

    $usersData = [
        [1, 1, 1, 1, 'superadmin', 'super@alchemist.edu.np', 'Platform Director', '9851000000', password_hash('Super@2026', PASSWORD_BCRYPT), 'Executive'],
        [2, 1, 1, 2, 'admin', 'admin@alchemist.edu.np', 'Institutional Administrator', '9851000001', password_hash('Admin@2026', PASSWORD_BCRYPT), 'Administration'],
        [3, 1, 1, 3, 'principal', 'principal@alchemist.edu.np', 'Dr. Saroj Karki', '9851022334', password_hash('Principal@2026', PASSWORD_BCRYPT), 'Leadership'],
        [4, 1, 1, 4, 'teacher', 'rj.rana@alchemist.edu.np', 'RJ Rana', '9851098765', password_hash('Teacher@2026', PASSWORD_BCRYPT), 'Mathematics & STEM'],
        [5, 1, 1, 5, 'accountant', 'accounts@alchemist.edu.np', 'Bimal Adhikari', '9841334455', password_hash('Accountant@2026', PASSWORD_BCRYPT), 'Accounts & Finance'],
        [6, 1, 1, 6, 'librarian', 'library@alchemist.edu.np', 'Gita Shrestha', '9860112233', password_hash('Librarian@2026', PASSWORD_BCRYPT), 'Library Guild'],
        [7, 1, 1, 7, 'parent', 'guardian.aarav@gmail.com', 'Sunita Sharma (Guardian)', '9841234567', password_hash('Parent@2026', PASSWORD_BCRYPT), 'Parent Community'],
        [8, 1, 1, 8, 'student', 'aarav.sharma@alchemist.edu.np', 'Aarav Sharma', '9841234567', password_hash('Student@2026', PASSWORD_BCRYPT), 'Secondary Grade 10'],
    ];

    $userInsert = $pdo->prepare("
        INSERT INTO users (id, school_id, branch_id, role_id, username, email, name, phone, password_hash, department, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
        ON DUPLICATE KEY UPDATE name = VALUES(name), role_id = VALUES(role_id), password_hash = VALUES(password_hash), department = VALUES(department)
    ");

    foreach ($usersData as $u) {
        $userInsert->execute($u);
    }
    echo "DONE\n";

    // 4. Seed Academic Years (Dual Calendar AD & BS)
    echo "[4/12] Seeding Dual Academic Years (AD & BS)... ";
    $yearStmt = $pdo->prepare("
        INSERT INTO academic_years (id, school_id, year_bs, year_ad, start_date_bs, end_date_bs, start_date_ad, end_date_ad, is_current)
        VALUES 
        (1, 1, '2083', '2026/2027', '2083-01-01', '2083-12-30', '2026-04-14', '2027-04-13', 1),
        (2, 1, '2082', '2025/2026', '2082-01-01', '2082-12-30', '2025-04-14', '2026-04-13', 0)
        ON DUPLICATE KEY UPDATE is_current = VALUES(is_current)
    ");
    $yearStmt->execute();
    echo "DONE\n";

    // 5. Seed Classes & Sections across Branches
    echo "[5/12] Seeding Classes & Sections... ";
    $classesData = [
        [1, 1, 1, 'Playgroup', 1, 'Foundation'],
        [2, 1, 1, 'Nursery', 2, 'Foundation'],
        [3, 1, 1, 'Grade 1', 3, 'Primary'],
        [4, 1, 1, 'Grade 5', 7, 'Primary'],
        [5, 1, 1, 'Grade 8', 10, 'Lower Secondary'],
        [6, 1, 1, 'Grade 9', 11, 'Secondary'],
        [7, 1, 1, 'Grade 10', 12, 'Secondary'],
        [8, 1, 1, 'Grade 11 (+2 Science)', 13, 'Higher Secondary'],
        [9, 1, 1, 'Grade 11 (+2 Management)', 14, 'Higher Secondary'],
    ];

    $classInsert = $pdo->prepare("
        INSERT INTO classes (id, school_id, branch_id, name, order_index, faculty)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name = VALUES(name), order_index = VALUES(order_index)
    ");
    foreach ($classesData as $c) {
        $classInsert->execute($c);
    }

    $sectionsData = [
        [1, 1, 1, 7, 'Section A', 'Room 104', 4, 40],
        [2, 1, 1, 7, 'Section B', 'Room 105', 4, 38],
        [3, 1, 1, 6, 'Section A', 'Room 102', 3, 40],
        [4, 1, 1, 8, 'Einstein Science Guild', 'Lab 3', 3, 45],
    ];

    $secInsert = $pdo->prepare("
        INSERT INTO sections (id, school_id, branch_id, class_id, name, room_no, class_teacher_id, capacity)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name = VALUES(name), room_no = VALUES(room_no)
    ");
    foreach ($sectionsData as $s) {
        $secInsert->execute($s);
    }
    echo "DONE\n";

    // 6. Seed Subjects (Nepal CDC Matrix)
    echo "[6/12] Seeding Subjects & Curriculum Matrix... ";
    $subjectsData = [
        [1, 1, 'ENG-101', 'Compulsory English', 75, 27, 25, 10, 4.0, 0],
        [2, 1, 'NEP-102', 'Compulsory Nepali', 75, 27, 25, 10, 4.0, 0],
        [3, 1, 'MTH-103', 'Compulsory Mathematics', 75, 27, 25, 10, 4.0, 0],
        [4, 1, 'SCI-104', 'Science & Technology', 75, 27, 25, 10, 4.0, 0],
        [5, 1, 'SOC-105', 'Social Studies & Life Skills', 75, 27, 25, 10, 4.0, 0],
        [6, 1, 'OPT-106', 'Optional I: Applied Mathematics', 75, 27, 25, 10, 4.0, 1],
        [7, 1, 'ICT-107', 'Computer Applications & Coding', 50, 18, 50, 20, 4.0, 0],
    ];

    $subInsert = $pdo->prepare("
        INSERT INTO subjects (id, school_id, code, name, theory_full_marks, theory_pass_marks, practical_full_marks, practical_pass_marks, credit_hours, is_optional)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name = VALUES(name), theory_full_marks = VALUES(theory_full_marks)
    ");
    foreach ($subjectsData as $sub) {
        $subInsert->execute($sub);
    }
    echo "DONE\n";

    // 7. Seed Student Profiles with Photos & Guardian Details
    echo "[7/12] Seeding Student Profiles & Documentation Vault... ";
    $studentsData = [
        [
            1, 1, 1, 'AA-2026-1049', 14, 'Aarav', 'Sharma', 'Male', '2010-04-18', '2067-01-05', 'O+',
            'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
            7, 1, 1, 'Sunita Sharma', 'Mother', '9841234567', 'guardian.aarav@gmail.com', 'Professor',
            'Jorpati-5, Kathmandu', 'Jorpati Oralo (Stop 3)', 8, 7, 'active'
        ],
        [
            2, 1, 1, 'AA-2026-1050', 2, 'Sneha', 'Adhikari', 'Female', '2010-08-22', '2067-05-06', 'A+',
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
            7, 1, 1, 'Hari Prasad Adhikari', 'Father', '9841987654', 'hari.adhikari@gmail.com', 'Senior Engineer',
            'Bouddha, Kathmandu', 'Bouddha Stupa Gate', NULL, NULL, 'active'
        ],
        [
            3, 1, 1, 'AA-2026-1051', 3, 'Rohan', 'Shrestha', 'Male', '2010-02-14', '2066-11-02', 'B+',
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
            7, 1, 1, 'Bikash Shrestha', 'Father', '9851122334', 'bikash.sh@gmail.com', 'Business Entrepreneur',
            'Chabahil, Kathmandu', 'Chabahil Chowk', NULL, NULL, 'active'
        ],
    ];

    $stuInsert = $pdo->prepare("
        INSERT INTO students (
            id, school_id, branch_id, admission_no, roll_no, first_name, last_name, gender, dob_ad, dob_bs, blood_group,
            photo_url, class_id, section_id, academic_year_id, guardian_name, guardian_relation, guardian_phone,
            guardian_email, guardian_occupation, current_address, pickup_stop, user_id, parent_user_id, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name), guardian_phone = VALUES(guardian_phone)
    ");
    foreach ($studentsData as $st) {
        $stuInsert->execute($st);
    }
    echo "DONE\n";

    // 8. Seed Attendance (Daily & Per-Period)
    echo "[8/12] Seeding Attendance Records (Daily & Per-Period)... ";
    $attStmt = $pdo->prepare("
        INSERT INTO attendance_records (school_id, branch_id, class_id, section_id, student_id, type, period_no, date_ad, date_bs, status, remarks, marked_by)
        VALUES 
        (1, 1, 7, 1, 1, 'daily', NULL, '2026-10-14', '2083-06-28', 'present', 'Punctual', 4),
        (1, 1, 7, 1, 1, 'daily', NULL, '2026-10-15', '2083-06-29', 'present', 'Active in class', 4),
        (1, 1, 7, 1, 1, 'daily', NULL, '2026-10-16', '2083-06-30', 'present', 'Present today', 4),
        (1, 1, 7, 1, 1, 'period', 1, '2026-10-16', '2083-06-30', 'present', 'Period 1: Math', 4),
        (1, 1, 7, 1, 1, 'period', 2, '2026-10-16', '2083-06-30', 'present', 'Period 2: Science', 4),
        (1, 1, 7, 1, 3, 'daily', NULL, '2026-10-16', '2083-06-30', 'late', '15m late traffic', 4),
        (1, 1, 7, 1, 2, 'daily', NULL, '2026-10-16', '2083-06-30', 'present', 'Present', 4)
        ON DUPLICATE KEY UPDATE status = VALUES(status)
    ");
    $attStmt->execute();
    echo "DONE\n";

    // 9. Seed Fee Categories, Structures, Invoices, Receipts
    echo "[9/12] Seeding Fees, Tariffs, Invoices & Receipts... ";
    $pdo->exec("
        INSERT INTO fee_categories (id, school_id, name, code)
        VALUES 
        (1, 1, 'Monthly Tuition Fee', 'TUITION'),
        (2, 1, 'Science & Computer Lab Fee', 'LAB'),
        (3, 1, 'School Bus Transportation', 'TRANSPORT'),
        (4, 1, 'Terminal Exam Fee', 'EXAM')
        ON DUPLICATE KEY UPDATE name = VALUES(name);

        INSERT INTO fee_structures (id, school_id, branch_id, class_id, fee_category_id, amount, frequency)
        VALUES 
        (1, 1, 1, 7, 1, 5500.00, 'monthly'),
        (2, 1, 1, 7, 2, 1200.00, 'monthly'),
        (3, 1, 1, 7, 3, 1500.00, 'monthly'),
        (4, 1, 1, 7, 4, 1500.00, 'term')
        ON DUPLICATE KEY UPDATE amount = VALUES(amount);

        INSERT INTO fee_invoices (id, school_id, branch_id, student_id, invoice_no, billing_month, subtotal_amount, discount_amount, net_amount, paid_amount, balance_due, due_date_ad, due_date_bs, status)
        VALUES 
        (1, 1, 1, 1, 'INV-2083-01049', 'Ashwin', 8200.00, 0.00, 8200.00, 8200.00, 0.00, '2026-10-15', '2083-06-29', 'paid'),
        (2, 1, 1, 3, 'INV-2083-01051', 'Ashwin', 8200.00, 0.00, 8200.00, 0.00, 8200.00, '2026-10-10', '2083-06-24', 'unpaid')
        ON DUPLICATE KEY UPDATE status = VALUES(status);

        INSERT INTO fee_receipts (id, school_id, branch_id, invoice_id, student_id, receipt_no, amount_paid, payment_method, transaction_ref, payment_date_ad, payment_date_bs, cashier_id, cashier_name, status)
        VALUES (1, 1, 1, 1, 1, 'REC-2083-09881', 8200.00, 'esewa', 'ESEWA-992144', '2026-10-15', '2083-06-29', 5, 'Bimal Adhikari', 'cleared')
        ON DUPLICATE KEY UPDATE status = VALUES(status);
    ");
    echo "DONE\n";

    // 10. Seed Timetable with Clash-Free Period Slots
    echo "[10/12] Seeding Clash-Free Weekly Timetable Slots... ";
    $slots = [
        [1, 1, 1, 7, 1, 3, 4, 'Room 104', 'Sunday', 1, '09:45:00', '10:30:00'],
        [2, 1, 1, 7, 1, 4, 3, 'Einstein Lab', 'Sunday', 2, '10:30:00', '11:15:00'],
        [3, 1, 1, 7, 1, 1, 3, 'Room 104', 'Sunday', 3, '11:15:00', '12:00:00'],
        [4, 1, 1, 7, 1, 5, 2, 'Room 104', 'Sunday', 4, '12:45:00', '13:30:00'],
        [5, 1, 1, 7, 1, 6, 4, 'Room 104', 'Sunday', 5, '13:30:00', '14:15:00'],
        [6, 1, 1, 7, 1, 7, 4, 'IT Lab 2', 'Sunday', 6, '14:15:00', '15:00:00'],
    ];

    $slotStmt = $pdo->prepare("
        INSERT INTO timetable_slots (id, school_id, branch_id, class_id, section_id, subject_id, teacher_id, room_no, day_of_week, period_no, start_time, end_time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE room_no = VALUES(room_no)
    ");
    foreach ($slots as $sl) {
        $slotStmt->execute($sl);
    }
    echo "DONE\n";

    // 11. Seed Library, Transport & Staff Payroll
    echo "[11/12] Seeding Library Books, Transport Routes & Payroll... ";
    $pdo->exec("
        INSERT INTO library_books (id, school_id, branch_id, accession_no, isbn, title, author, category, total_copies, available_copies, rack_no)
        VALUES 
        (1, 1, 1, 'LIB-1001', '978-0131103627', 'The C Programming Language (2nd Edition)', 'Brian Kernighan & Dennis Ritchie', 'Computer Science', 8, 7, 'Rack CS-02'),
        (2, 1, 1, 'LIB-1002', '978-0199535569', 'Muna Madan (Nepali Classic Epic)', 'Laxmi Prasad Devkota', 'Nepali Literature', 15, 14, 'Rack NEP-01'),
        (3, 1, 1, 'LIB-1003', '978-0486600888', 'Calculus Made Easy', 'Silvanus P. Thompson', 'Mathematics', 10, 10, 'Rack MTH-04')
        ON DUPLICATE KEY UPDATE title = VALUES(title);

        INSERT INTO library_issues (id, school_id, branch_id, book_id, borrower_type, student_id, issue_date_ad, due_date_ad, status)
        VALUES (1, 1, 1, 1, 'student', 1, '2026-10-10', '2026-10-24', 'issued')
        ON DUPLICATE KEY UPDATE status = VALUES(status);

        INSERT INTO transport_vehicles (id, school_id, branch_id, vehicle_no, driver_name, driver_phone, helper_name, capacity, status)
        VALUES (1, 1, 1, 'BA 2 KHA 8492', 'Hari Bahadur Tamang', '+977 9841556677', 'Bikash Rai', 36, 'active')
        ON DUPLICATE KEY UPDATE driver_name = VALUES(driver_name);

        INSERT INTO transport_routes (id, school_id, branch_id, route_code, route_title, vehicle_id, monthly_fare, stops_json)
        VALUES (1, 1, 1, 'ROUTE-03', 'Route 3 (Eastern Belt: Jorpati - Bouddha - Chabahil)', 1, 1500.00, '[{\"name\":\"Jorpati Oralo\",\"time\":\"08:35 AM\"},{\"name\":\"Bouddha Stupa\",\"time\":\"08:48 AM\"},{\"name\":\"Chabahil\",\"time\":\"09:02 AM\"}]')
        ON DUPLICATE KEY UPDATE route_title = VALUES(route_title);

        INSERT INTO payroll_salary_structures (id, school_id, user_id, basic_salary, house_rent_allowance, dearness_allowance, medical_allowance, pf_deduction, cit_deduction, social_security_tax)
        VALUES 
        (1, 1, 4, 45000.00, 8000.00, 5000.00, 2000.00, 4500.00, 2000.00, 600.00),
        (2, 1, 5, 38000.00, 6000.00, 4000.00, 1500.00, 3800.00, 1500.00, 495.00)
        ON DUPLICATE KEY UPDATE basic_salary = VALUES(basic_salary);

        INSERT INTO payroll_slips (id, school_id, branch_id, slip_no, user_id, month_bs, year_bs, basic_salary, total_allowances, gross_salary, total_deductions, net_salary, status, paid_at)
        VALUES (1, 1, 1, 'PAY-2083-ASHWIN-004', 4, 'Ashwin', '2083', 45000.00, 15000.00, 60000.00, 7100.00, 52900.00, 'paid', '2026-10-15')
        ON DUPLICATE KEY UPDATE status = VALUES(status);
    ");
    echo "DONE\n";

    // 12. Seed Admissions, Notifications & Audit Log Records
    echo "[12/12] Seeding Admissions Applications, Notifications & Audit Logs... ";
    $pdo->exec("
        INSERT INTO admission_applications (id, school_id, branch_id, application_no, applicant_name, gender, dob_bs, applying_grade, applying_stream, previous_school, previous_gpa, guardian_name, guardian_phone, entrance_score, merit_rank, status)
        VALUES 
        (1, 1, 1, 'ADM-2083-001', 'Samir Acharya', 'Male', '2067-02-12', 'Grade 11 (+2 Science)', 'Science', 'Galaxy Public School', 3.85, 'Dev Acharya', '9849223311', 88.5, 1, 'admitted'),
        (2, 1, 1, 'ADM-2083-002', 'Pooja Timilsina', 'Female', '2067-07-19', 'Grade 10', 'General', 'Gandaki Boarding Pokhara', 3.70, 'Ramesh Timilsina', '9860112233', 79.0, 4, 'merit_listed')
        ON DUPLICATE KEY UPDATE applicant_name = VALUES(applicant_name);

        INSERT INTO notifications (id, school_id, user_id, title, body, type, is_read)
        VALUES 
        (1, 1, 8, 'Math Homework Evaluated', 'RJ Rana graded Unit 8 Trigonometry proof: Scored 19/20 (A+)', 'academic', 0),
        (2, 1, 8, 'Bus Transit Arrival', 'Route 3 (BA 2 KHA 8492) is approaching Jorpati Oralo stop.', 'transport', 0),
        (3, 1, 7, 'Ashwin Fee Cleared', 'Fee receipt REC-2083-09881 for NPR 8,200 has been verified.', 'fee', 1)
        ON DUPLICATE KEY UPDATE title = VALUES(title);

        INSERT INTO audit_logs (school_id, branch_id, user_id, user_name, user_role, action, entity_type, entity_id, old_values, new_values, ip_address)
        VALUES 
        (1, 1, 2, 'Institutional Administrator', 'admin', 'STUDENT_ENROLL', 'students', '1', NULL, '{\"name\":\"Aarav Sharma\",\"grade\":\"Grade 10\"}', '127.0.0.1'),
        (1, 1, 5, 'Bimal Adhikari', 'accountant', 'FEE_PAYMENT_COLLECT', 'fee_receipts', '1', NULL, '{\"receipt\":\"REC-2083-09881\",\"amount\":8200}', '127.0.0.1');
    ");
    echo "DONE\n";

    $pdo->commit();

    echo "\n========================================================\n";
    echo " ALL SEED DATA SUCCESSFULLY POPULATED!\n";
    echo " Available Demo Logins (Password shown in brackets):\n";
    echo "  - Superadmin: superadmin [Super@2026]\n";
    echo "  - Admin:      admin      [Admin@2026]\n";
    echo "  - Principal:  principal  [Principal@2026]\n";
    echo "  - Teacher:    teacher    [Teacher@2026]\n";
    echo "  - Accountant: accountant [Accountant@2026]\n";
    echo "  - Librarian:  librarian  [Librarian@2026]\n";
    echo "  - Parent:     parent     [Parent@2026]\n";
    echo "  - Student:    student    [Student@2026]\n";
    echo "========================================================\n";

} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo "\n[ERROR] Seeding failed:\n" . $e->getMessage() . "\n";
    exit(1);
}

