-- ========================================================
-- ALCHEMIST ACADEMY / MULTI-TENANT SCHOOL ERP & CMS SCHEMA
-- Ready to import in cPanel phpMyAdmin (LiteSpeed / MySQL)
-- ========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- 1. SCHOOLS & TENANTS (Master SaaS Registry)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `schools` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique school identifier (e.g. alchemist, sunshine)',
  `name` VARCHAR(255) NOT NULL,
  `domain` VARCHAR(255) NULL UNIQUE COMMENT 'Custom domain or subdomain (e.g. alchemist.edu.np)',
  `contact_email` VARCHAR(150) NULL,
  `contact_phone` VARCHAR(50) NULL,
  `address` VARCHAR(255) NULL,
  `plan` ENUM('saas_monthly', 'saas_yearly', 'enterprise_onetime') DEFAULT 'saas_yearly',
  `subscription_status` ENUM('trial', 'active', 'suspended', 'cancelled') DEFAULT 'active',
  `cms_enabled` TINYINT(1) DEFAULT 1,
  `erp_enabled` TINYINT(1) DEFAULT 1,
  `finance_enabled` TINYINT(1) DEFAULT 1,
  `subscription_expires_at` DATE NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Pilot School: Alchemist Academy (ID = 1)
INSERT INTO `schools` (`id`, `code`, `name`, `domain`, `contact_email`, `contact_phone`, `address`, `subscription_status`, `cms_enabled`, `erp_enabled`, `finance_enabled`)
VALUES (1, 'alchemist', 'Alchemist Academy', 'alchemistacademy.edu.np', 'info@alchemistacademy.edu.np', '01-4915000', 'Jorpati, Gokarneshwor-5, Kathmandu', 'active', 1, 1, 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- --------------------------------------------------------
-- 2. USERS & STAFF CREDENTIALS (Role-Based Access)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL DEFAULT 1,
  `username` VARCHAR(80) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('superadmin', 'admin', 'accountant', 'teacher', 'academic', 'admissions', 'editor', 'student', 'parent') NOT NULL DEFAULT 'editor',
  `department` VARCHAR(100) DEFAULT 'General',
  `status` ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_school_username` (`school_id`, `username`),
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 3. SITE SETTINGS (12 CMS Modules Stored per School)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `site_settings` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL DEFAULT 1,
  `settings_payload` LONGTEXT NOT NULL COMMENT 'Complete JSON tree of 12 modules matching defaultSiteData.js',
  `updated_by` INT UNSIGNED NULL,
  `version` INT UNSIGNED DEFAULT 1,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_school_settings` (`school_id`),
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 4. MEDIA LIBRARY & SEO ALT ASSETS
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `media_library` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL DEFAULT 1,
  `title` VARCHAR(255) NOT NULL,
  `alt_text` VARCHAR(500) NOT NULL COMMENT 'Crucial for SEO Google Image Rankings',
  `file_name` VARCHAR(255) NOT NULL,
  `file_url` VARCHAR(500) NOT NULL,
  `file_size_kb` DECIMAL(10, 2) DEFAULT 0.00,
  `mime_type` VARCHAR(100) DEFAULT 'image/jpeg',
  `category` VARCHAR(100) DEFAULT 'Campus & Events',
  `tags` VARCHAR(255) DEFAULT '',
  `is_default` TINYINT(1) DEFAULT 0,
  `uploaded_by` INT UNSIGNED NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_school_cat` (`school_id`, `category`),
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 5. ADMISSION INQUIRIES & CRM LEADS
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admission_inquiries` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL DEFAULT 1,
  `parent_name` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `email` VARCHAR(150) NULL,
  `child_grade` VARCHAR(100) NOT NULL,
  `message` TEXT NULL,
  `lead_status` ENUM('new', 'contacted', 'campus_visited', 'enrolled', 'closed') DEFAULT 'new',
  `counselor_notes` TEXT NULL,
  `ip_address` VARCHAR(45) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_school_status` (`school_id`, `lead_status`),
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 6. FOUNDATION FOR PHASE 2: ACADEMIC ERP
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `academic_years` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `year_bs` VARCHAR(20) NOT NULL COMMENT 'e.g. 2081/2082',
  `year_ad` VARCHAR(20) NOT NULL COMMENT 'e.g. 2024/2025',
  `start_date_bs` VARCHAR(20) NULL,
  `end_date_bs` VARCHAR(20) NULL,
  `is_current` TINYINT(1) DEFAULT 1,
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `classes` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(50) NOT NULL COMMENT 'e.g. Nursery, Grade 1, Grade 10',
  `order_index` SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sections` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `class_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(50) NOT NULL COMMENT 'e.g. Alpha, Beta, Lotus',
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `students` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `admission_no` VARCHAR(50) NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `class_id` INT UNSIGNED NOT NULL,
  `section_id` INT UNSIGNED NOT NULL,
  `roll_no` INT UNSIGNED NULL,
  `gender` ENUM('Male', 'Female', 'Other') DEFAULT 'Male',
  `dob_bs` VARCHAR(20) NULL,
  `blood_group` VARCHAR(10) NULL,
  `primary_phone` VARCHAR(50) NULL,
  `address` VARCHAR(255) NULL,
  `photo_url` VARCHAR(500) NULL,
  `status` ENUM('active', 'passed_out', 'transferred', 'suspended') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_adm_no` (`school_id`, `admission_no`),
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`),
  FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`),
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

