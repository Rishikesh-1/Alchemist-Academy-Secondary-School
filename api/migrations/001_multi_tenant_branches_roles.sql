-- ========================================================
-- MIGRATION 001: Multi-Tenant Core, Branches, Roles & Audit
-- ========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Master Tenants / Schools
CREATE TABLE IF NOT EXISTS `schools` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `domain` VARCHAR(255) NULL UNIQUE,
  `contact_email` VARCHAR(150) NULL,
  `contact_phone` VARCHAR(50) NULL,
  `address` VARCHAR(255) NULL,
  `plan` ENUM('basic', 'intermediate', 'pro', 'enterprise') DEFAULT 'pro',
  `subscription_status` ENUM('trial', 'active', 'suspended', 'cancelled') DEFAULT 'active',
  `subscription_expires_at` DATE NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Branches per School (Multi-Branch support)
CREATE TABLE IF NOT EXISTS `branches` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(150) NOT NULL COMMENT 'e.g. Main Campus, City Wing, Junior Block',
  `code` VARCHAR(50) NOT NULL COMMENT 'e.g. BR-MAIN, BR-CITY',
  `address` VARCHAR(255) NOT NULL,
  `contact_phone` VARCHAR(50) NULL,
  `contact_email` VARCHAR(150) NULL,
  `principal_name` VARCHAR(150) NULL,
  `is_main` TINYINT(1) DEFAULT 0,
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_school_branch_code` (`school_id`, `code`),
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. System Roles (Admin, Principal, Teacher, Accountant, Librarian, Parent, Student)
CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `is_system` TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `roles` (`id`, `slug`, `name`, `description`) VALUES
(1, 'superadmin', 'Super Administrator', 'SaaS Platform Owner with universal control across all schools'),
(2, 'admin', 'School Administrator', 'Institutional administrator with complete school management privileges'),
(3, 'principal', 'School Principal / Headmaster', 'Academic & institutional head with complete oversight, approval and reporting access'),
(4, 'teacher', 'Academic Teacher / Faculty', 'Classroom roll call, lesson planning, marks entry, and assignment evaluations'),
(5, 'accountant', 'Bursar / Accountant', 'Fee billing, cashier counter payments, discounts, concessions, and financial reports'),
(6, 'librarian', 'Librarian', 'Book cataloging, issue and return circulation, and overdue fines'),
(7, 'parent', 'Parent / Guardian', 'Monitor ward attendance, fee dues, marks, report cards, and notices'),
(8, 'student', 'Student', 'Student self-service portal: homework, attendance calendar, admit card, fee receipts')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 4. Granular Permissions Registry
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `module` VARCHAR(50) NOT NULL,
  `description` VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Role-Permissions Mapping
CREATE TABLE IF NOT EXISTS `role_permissions` (
  `role_id` INT UNSIGNED NOT NULL,
  `permission_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`role_id`, `permission_id`),
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Users & Credentials (Secure authentication with password_hash)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL DEFAULT 1,
  `branch_id` INT UNSIGNED NULL,
  `role_id` INT UNSIGNED NOT NULL DEFAULT 2,
  `username` VARCHAR(80) NOT NULL,
  `email` VARCHAR(150) NULL,
  `name` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(50) NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `department` VARCHAR(100) DEFAULT 'General',
  `status` ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  `failed_login_attempts` SMALLINT UNSIGNED DEFAULT 0,
  `locked_until` DATETIME NULL,
  `last_login_at` DATETIME NULL,
  `last_login_ip` VARCHAR(45) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_school_user` (`school_id`, `username`),
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Server-Side Rate Limiter & Login Attempts Log
CREATE TABLE IF NOT EXISTS `login_attempts` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `ip_address` VARCHAR(45) NOT NULL,
  `username` VARCHAR(80) NOT NULL,
  `attempt_time` INT UNSIGNED NOT NULL,
  `is_success` TINYINT(1) DEFAULT 0,
  INDEX `idx_ip_time` (`ip_address`, `attempt_time`),
  INDEX `idx_user_time` (`username`, `attempt_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Immutable System Audit Logs (Who, When, What entity, Old vs New values)
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `branch_id` INT UNSIGNED NULL,
  `user_id` INT UNSIGNED NULL,
  `user_name` VARCHAR(150) NULL,
  `user_role` VARCHAR(50) NULL,
  `action` VARCHAR(100) NOT NULL COMMENT 'e.g. MARKS_UPDATE, FEE_COLLECT, STUDENT_PROMOTE, PROFILE_EDIT',
  `entity_type` VARCHAR(50) NOT NULL COMMENT 'e.g. marks, fees, students, attendance',
  `entity_id` VARCHAR(50) NOT NULL,
  `old_values` LONGTEXT NULL COMMENT 'JSON snapshot before change',
  `new_values` LONGTEXT NULL COMMENT 'JSON snapshot after change',
  `ip_address` VARCHAR(45) NULL,
  `user_agent` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_audit_entity` (`school_id`, `entity_type`, `entity_id`),
  INDEX `idx_audit_user` (`school_id`, `user_id`, `created_at`),
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

