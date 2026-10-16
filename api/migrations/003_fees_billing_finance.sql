-- ========================================================
-- MIGRATION 003: Fees, Structures, Installments, Receipts & Defaulters
-- ========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Fee Categories
CREATE TABLE IF NOT EXISTS `fee_categories` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(100) NOT NULL COMMENT 'e.g. Monthly Tuition, Terminal Exam, Science Lab, ICT, Bus',
  `code` VARCHAR(50) NOT NULL,
  `description` VARCHAR(255) NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  UNIQUE KEY `unique_school_fee_code` (`school_id`, `code`),
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Fee Structures (Class & Branch specific tariffs)
CREATE TABLE IF NOT EXISTS `fee_structures` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `branch_id` INT UNSIGNED NULL,
  `class_id` INT UNSIGNED NOT NULL,
  `fee_category_id` INT UNSIGNED NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `frequency` ENUM('monthly', 'term', 'annual', 'one_time') DEFAULT 'monthly',
  `academic_year_id` INT UNSIGNED NULL,
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`fee_category_id`) REFERENCES `fee_categories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Student Fee Discounts / Waivers / Scholarships
CREATE TABLE IF NOT EXISTS `student_fee_discounts` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `student_id` INT UNSIGNED NOT NULL,
  `discount_name` VARCHAR(150) NOT NULL COMMENT 'e.g. Merit 50% Scholarship, Sibling Concession, Staff Child Waiver',
  `discount_type` ENUM('percentage', 'fixed_amount') DEFAULT 'percentage',
  `discount_value` DECIMAL(10, 2) NOT NULL,
  `fee_category_id` INT UNSIGNED NULL COMMENT 'Applies to specific category or all if NULL',
  `approved_by` INT UNSIGNED NULL,
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Fee Invoices / Bill Demands
CREATE TABLE IF NOT EXISTS `fee_invoices` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `branch_id` INT UNSIGNED NULL,
  `student_id` INT UNSIGNED NOT NULL,
  `invoice_no` VARCHAR(50) NOT NULL UNIQUE COMMENT 'e.g. INV-2083-10492',
  `billing_month` VARCHAR(20) NOT NULL COMMENT 'e.g. Baisakh, Jestha, Ashwin',
  `academic_year_id` INT UNSIGNED NULL,
  `subtotal_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `discount_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `fine_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `net_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `paid_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `balance_due` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `due_date_ad` DATE NOT NULL,
  `due_date_bs` VARCHAR(20) NOT NULL,
  `status` ENUM('unpaid', 'partially_paid', 'paid', 'waived') DEFAULT 'unpaid',
  `line_items_json` LONGTEXT NULL COMMENT 'Breakdown of categories and amounts',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_defaulter_check` (`school_id`, `balance_due`, `due_date_ad`),
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Fee Receipts & Payments Log
CREATE TABLE IF NOT EXISTS `fee_receipts` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `branch_id` INT UNSIGNED NULL,
  `invoice_id` BIGINT UNSIGNED NULL,
  `student_id` INT UNSIGNED NOT NULL,
  `receipt_no` VARCHAR(50) NOT NULL UNIQUE COMMENT 'e.g. REC-2083-0941',
  `amount_paid` DECIMAL(12, 2) NOT NULL,
  `payment_method` ENUM('cash', 'esewa', 'khalti', 'fonepay', 'bank_transfer', 'cheque') DEFAULT 'cash',
  `transaction_ref` VARCHAR(100) NULL COMMENT 'Bank Slip No, eSewa Txn ID, Khalti Token',
  `payment_date_ad` DATE NOT NULL,
  `payment_date_bs` VARCHAR(20) NOT NULL,
  `cashier_id` INT UNSIGNED NULL,
  `cashier_name` VARCHAR(150) NULL,
  `notes` VARCHAR(255) NULL,
  `status` ENUM('cleared', 'reversed', 'bounced') DEFAULT 'cleared',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`invoice_id`) REFERENCES `fee_invoices`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`cashier_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Due Reminders Dispatch History
CREATE TABLE IF NOT EXISTS `fee_due_reminders` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `invoice_id` BIGINT UNSIGNED NOT NULL,
  `student_id` INT UNSIGNED NOT NULL,
  `parent_phone` VARCHAR(50) NOT NULL,
  `parent_email` VARCHAR(150) NULL,
  `channel` ENUM('sms', 'email', 'in_app') DEFAULT 'sms',
  `reminder_level` ENUM('friendly', 'due_date', 'overdue_urgent') DEFAULT 'due_date',
  `message_body` TEXT NOT NULL,
  `sent_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`invoice_id`) REFERENCES `fee_invoices`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

