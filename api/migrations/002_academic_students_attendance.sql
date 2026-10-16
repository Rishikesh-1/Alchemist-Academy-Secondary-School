-- ========================================================
-- MIGRATION 002: Academic Core, Students, Attendance & Promotions
-- ========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Academic Years (AD and BS dual calendar)
CREATE TABLE IF NOT EXISTS `academic_years` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `year_bs` VARCHAR(20) NOT NULL COMMENT 'e.g. 2081/2082 or 2083',
  `year_ad` VARCHAR(20) NOT NULL COMMENT 'e.g. 2026/2027',
  `start_date_bs` VARCHAR(20) NULL,
  `end_date_bs` VARCHAR(20) NULL,
  `start_date_ad` DATE NULL,
  `end_date_ad` DATE NULL,
  `is_current` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Classes (Class/Grade level per branch)
CREATE TABLE IF NOT EXISTS `classes` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `branch_id` INT UNSIGNED NULL,
  `name` VARCHAR(50) NOT NULL COMMENT 'e.g. Nursery, Grade 1 ... Grade 10, +2 Science, +2 Mgmt',
  `order_index` SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  `faculty` VARCHAR(50) DEFAULT 'General' COMMENT 'General, Science, Management, Humanities',
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Sections
CREATE TABLE IF NOT EXISTS `sections` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `branch_id` INT UNSIGNED NULL,
  `class_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(50) NOT NULL COMMENT 'e.g. Section A, Section B, Everest, Lhotse',
  `room_no` VARCHAR(50) NULL,
  `class_teacher_id` INT UNSIGNED NULL,
  `capacity` INT UNSIGNED DEFAULT 40,
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`class_teacher_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Students Comprehensive Master Records
CREATE TABLE IF NOT EXISTS `students` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `branch_id` INT UNSIGNED NULL,
  `admission_no` VARCHAR(50) NOT NULL,
  `roll_no` INT UNSIGNED NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `full_name` VARCHAR(200) GENERATED ALWAYS AS (CONCAT(first_name, ' ', last_name)) VIRTUAL,
  `gender` ENUM('Male', 'Female', 'Other') DEFAULT 'Male',
  `dob_ad` DATE NULL,
  `dob_bs` VARCHAR(20) NULL COMMENT 'Bikram Sambat (वि.सं.) Date of Birth',
  `blood_group` VARCHAR(10) NULL,
  `photo_url` VARCHAR(500) NULL,
  `class_id` INT UNSIGNED NOT NULL,
  `section_id` INT UNSIGNED NOT NULL,
  `academic_year_id` INT UNSIGNED NULL,
  
  -- Guardian & Family details
  `guardian_name` VARCHAR(150) NOT NULL,
  `guardian_relation` VARCHAR(50) DEFAULT 'Father',
  `guardian_phone` VARCHAR(50) NOT NULL,
  `guardian_email` VARCHAR(150) NULL,
  `guardian_occupation` VARCHAR(100) NULL,
  `mother_name` VARCHAR(150) NULL,
  
  -- Address Details
  `permanent_address` VARCHAR(255) NULL,
  `current_address` VARCHAR(255) NULL,
  `municipality_ward` VARCHAR(100) NULL,
  `district` VARCHAR(100) DEFAULT 'Kathmandu',
  
  -- Transport
  `bus_route_id` INT UNSIGNED NULL,
  `pickup_stop` VARCHAR(150) NULL,
  
  -- Documents stored as JSON or dedicated vault
  `documents_json` LONGTEXT NULL COMMENT 'JSON array of uploaded certificates (Birth Cert, SEE, Nagarikta)',
  
  -- Account linking
  `user_id` INT UNSIGNED NULL COMMENT 'Linked user login for student portal',
  `parent_user_id` INT UNSIGNED NULL COMMENT 'Linked user login for parent portal',
  
  -- Status & TC
  `status` ENUM('active', 'graduated', 'transferred', 'suspended') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY `unique_school_adm_no` (`school_id`, `admission_no`),
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`),
  FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`),
  FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`parent_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Student Academic Promotions History
CREATE TABLE IF NOT EXISTS `student_promotions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `student_id` INT UNSIGNED NOT NULL,
  `from_academic_year_id` INT UNSIGNED NOT NULL,
  `to_academic_year_id` INT UNSIGNED NOT NULL,
  `from_class_id` INT UNSIGNED NOT NULL,
  `to_class_id` INT UNSIGNED NOT NULL,
  `from_section_id` INT UNSIGNED NOT NULL,
  `to_section_id` INT UNSIGNED NOT NULL,
  `promotion_type` ENUM('promoted', 'detained', 'graduated', 'double_promoted') DEFAULT 'promoted',
  `final_gpa` DECIMAL(3, 2) NULL,
  `promoted_by` INT UNSIGNED NULL,
  `promotion_date` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Transfer Certificates (TC) & Character Certificates
CREATE TABLE IF NOT EXISTS `transfer_certificates` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `branch_id` INT UNSIGNED NULL,
  `student_id` INT UNSIGNED NOT NULL,
  `tc_number` VARCHAR(50) NOT NULL UNIQUE COMMENT 'e.g. TC-2083-0042',
  `date_of_issue_ad` DATE NOT NULL,
  `date_of_issue_bs` VARCHAR(20) NOT NULL,
  `reason_for_leaving` VARCHAR(255) NOT NULL,
  `conduct_grade` ENUM('Exemplary', 'Good', 'Satisfactory') DEFAULT 'Exemplary',
  `dues_cleared` TINYINT(1) DEFAULT 1,
  `issued_by` INT UNSIGNED NULL,
  `remarks` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Attendance Records (Daily AND Per-Period Support)
CREATE TABLE IF NOT EXISTS `attendance_records` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `branch_id` INT UNSIGNED NULL,
  `class_id` INT UNSIGNED NOT NULL,
  `section_id` INT UNSIGNED NOT NULL,
  `student_id` INT UNSIGNED NOT NULL,
  `type` ENUM('daily', 'period') DEFAULT 'daily',
  `period_no` TINYINT UNSIGNED NULL COMMENT '1 to 8 if type is period; NULL if daily',
  `subject_id` INT UNSIGNED NULL,
  `date_ad` DATE NOT NULL,
  `date_bs` VARCHAR(20) NOT NULL,
  `status` ENUM('present', 'absent', 'late', 'excused', 'half_day') DEFAULT 'present',
  `remarks` VARCHAR(255) NULL,
  `marked_by` INT UNSIGNED NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_student_date_period` (`student_id`, `date_ad`, `type`, `period_no`),
  INDEX `idx_class_date` (`school_id`, `class_id`, `section_id`, `date_ad`),
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`marked_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Absence Alerts Dispatch Log
CREATE TABLE IF NOT EXISTS `absence_alerts` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `student_id` INT UNSIGNED NOT NULL,
  `date_ad` DATE NOT NULL,
  `guardian_phone` VARCHAR(50) NOT NULL,
  `guardian_email` VARCHAR(150) NULL,
  `channel` ENUM('sms', 'email', 'in_app', 'whatsapp') NOT NULL DEFAULT 'sms',
  `message_body` TEXT NOT NULL,
  `status` ENUM('queued', 'sent', 'failed') DEFAULT 'sent',
  `sent_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

