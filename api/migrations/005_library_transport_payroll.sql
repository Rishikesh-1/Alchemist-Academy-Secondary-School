-- ========================================================
-- MIGRATION 005: Library, Transport & Staff Payroll
-- ========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Library Books Catalog
CREATE TABLE IF NOT EXISTS `library_books` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `branch_id` INT UNSIGNED NULL,
  `accession_no` VARCHAR(50) NOT NULL COMMENT 'Unique barcode / catalog number',
  `isbn` VARCHAR(30) NULL,
  `title` VARCHAR(255) NOT NULL,
  `author` VARCHAR(150) NOT NULL,
  `publisher` VARCHAR(150) NULL,
  `edition` VARCHAR(50) NULL,
  `category` VARCHAR(100) NOT NULL COMMENT 'Fiction, Science, Mathematics, History, Literature',
  `rack_no` VARCHAR(50) NULL,
  `total_copies` INT UNSIGNED NOT NULL DEFAULT 1,
  `available_copies` INT UNSIGNED NOT NULL DEFAULT 1,
  `price` DECIMAL(10, 2) NULL,
  `status` ENUM('available', 'low_stock', 'archived') DEFAULT 'available',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_school_accession` (`school_id`, `accession_no`),
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Library Book Issues & Return Circulation Desk
CREATE TABLE IF NOT EXISTS `library_issues` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `branch_id` INT UNSIGNED NULL,
  `book_id` INT UNSIGNED NOT NULL,
  `borrower_type` ENUM('student', 'staff') DEFAULT 'student',
  `student_id` INT UNSIGNED NULL,
  `user_id` INT UNSIGNED NULL,
  `issue_date_ad` DATE NOT NULL,
  `due_date_ad` DATE NOT NULL,
  `return_date_ad` DATE NULL,
  `fine_per_day` DECIMAL(6, 2) DEFAULT 5.00,
  `fine_amount` DECIMAL(8, 2) DEFAULT 0.00,
  `is_fine_paid` TINYINT(1) DEFAULT 0,
  `status` ENUM('issued', 'returned', 'overdue', 'lost') DEFAULT 'issued',
  `issued_by` INT UNSIGNED NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`book_id`) REFERENCES `library_books`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Transport Vehicles
CREATE TABLE IF NOT EXISTS `transport_vehicles` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `branch_id` INT UNSIGNED NULL,
  `vehicle_no` VARCHAR(50) NOT NULL COMMENT 'e.g. BA 2 KHA 8492',
  `vehicle_model` VARCHAR(100) NULL,
  `driver_name` VARCHAR(100) NOT NULL,
  `driver_phone` VARCHAR(50) NOT NULL,
  `driver_license_no` VARCHAR(50) NULL,
  `helper_name` VARCHAR(100) NULL,
  `helper_phone` VARCHAR(50) NULL,
  `capacity` INT UNSIGNED NOT NULL DEFAULT 35,
  `status` ENUM('active', 'maintenance', 'idle') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_school_vehicle` (`school_id`, `vehicle_no`),
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Transport Routes & Stops
CREATE TABLE IF NOT EXISTS `transport_routes` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `branch_id` INT UNSIGNED NULL,
  `route_code` VARCHAR(50) NOT NULL COMMENT 'e.g. ROUTE-03',
  `route_title` VARCHAR(150) NOT NULL COMMENT 'e.g. Jorpati - Bouddha - Chabahil Express',
  `vehicle_id` INT UNSIGNED NULL,
  `monthly_fare` DECIMAL(10, 2) NOT NULL DEFAULT 1500.00,
  `stops_json` LONGTEXT NOT NULL COMMENT 'JSON array of stops with timing and coordinates',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`vehicle_id`) REFERENCES `transport_vehicles`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Staff Payroll Salary Structures (Nepalese Labor / Tax Norms)
CREATE TABLE IF NOT EXISTS `payroll_salary_structures` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL UNIQUE,
  `basic_salary` DECIMAL(12, 2) NOT NULL,
  `house_rent_allowance` DECIMAL(10, 2) DEFAULT 0.00,
  `dearness_allowance` DECIMAL(10, 2) DEFAULT 0.00,
  `medical_allowance` DECIMAL(10, 2) DEFAULT 0.00,
  `special_allowance` DECIMAL(10, 2) DEFAULT 0.00,
  `pf_deduction` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Provident Fund',
  `cit_deduction` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Citizen Investment Trust',
  `social_security_tax` DECIMAL(10, 2) DEFAULT 0.00 COMMENT '1% SST or income tax',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Monthly Payroll Slips
CREATE TABLE IF NOT EXISTS `payroll_slips` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `branch_id` INT UNSIGNED NULL,
  `slip_no` VARCHAR(50) NOT NULL UNIQUE COMMENT 'e.g. PAY-2083-ASHWIN-012',
  `user_id` INT UNSIGNED NOT NULL,
  `month_bs` VARCHAR(20) NOT NULL COMMENT 'e.g. Baisakh, Jestha, Ashwin',
  `year_bs` VARCHAR(20) NOT NULL,
  `basic_salary` DECIMAL(12, 2) NOT NULL,
  `total_allowances` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `gross_salary` DECIMAL(12, 2) NOT NULL,
  `total_deductions` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `net_salary` DECIMAL(12, 2) NOT NULL,
  `payment_method` ENUM('bank_transfer', 'cheque', 'cash') DEFAULT 'bank_transfer',
  `status` ENUM('generated', 'approved', 'paid') DEFAULT 'generated',
  `paid_at` DATE NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

