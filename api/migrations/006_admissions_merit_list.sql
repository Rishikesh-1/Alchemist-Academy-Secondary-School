-- ========================================================
-- MIGRATION 006: Admissions Applications, Merit Lists & Notifications
-- ========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Full Multi-Step Admission Application Forms
CREATE TABLE IF NOT EXISTS `admission_applications` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `branch_id` INT UNSIGNED NULL,
  `academic_year_id` INT UNSIGNED NULL,
  `application_no` VARCHAR(50) NOT NULL UNIQUE COMMENT 'e.g. ADM-2083-0491',
  
  -- Student Bio
  `applicant_name` VARCHAR(150) NOT NULL,
  `gender` ENUM('Male', 'Female', 'Other') DEFAULT 'Male',
  `dob_ad` DATE NULL,
  `dob_bs` VARCHAR(20) NULL,
  `blood_group` VARCHAR(10) NULL,
  `photo_url` VARCHAR(500) NULL,
  
  -- Program Applying
  `applying_grade` VARCHAR(50) NOT NULL COMMENT 'e.g. Grade 1, Grade 8, Grade 11 (+2 Science)',
  `applying_stream` VARCHAR(50) DEFAULT 'General' COMMENT 'General, Science, Management, Humanities',
  
  -- Previous Academic Credentials
  `previous_school` VARCHAR(200) NULL,
  `previous_gpa` DECIMAL(3, 2) NULL,
  `marksheet_url` VARCHAR(500) NULL,
  `character_cert_url` VARCHAR(500) NULL,
  
  -- Guardian Info
  `guardian_name` VARCHAR(150) NOT NULL,
  `guardian_relation` VARCHAR(50) DEFAULT 'Father',
  `guardian_phone` VARCHAR(50) NOT NULL,
  `guardian_email` VARCHAR(150) NULL,
  `permanent_address` VARCHAR(255) NULL,
  
  -- Entrance & Merit Engine
  `entrance_roll_no` VARCHAR(50) NULL,
  `entrance_exam_date` DATE NULL,
  `entrance_score` DECIMAL(5, 2) NULL,
  `merit_rank` INT UNSIGNED NULL,
  `quota_category` VARCHAR(50) DEFAULT 'Open' COMMENT 'Open, Merit, Remote Area, Sibling',
  
  -- Application Status
  `status` ENUM('submitted', 'verified', 'entrance_scheduled', 'merit_listed', 'admitted', 'rejected') DEFAULT 'submitted',
  `counselor_notes` TEXT NULL,
  `admitted_student_id` INT UNSIGNED NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX `idx_school_status` (`school_id`, `status`),
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`admitted_student_id`) REFERENCES `students`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Admissions Merit Lists
CREATE TABLE IF NOT EXISTS `admissions_merit_lists` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `branch_id` INT UNSIGNED NULL,
  `academic_year_id` INT UNSIGNED NULL,
  `title` VARCHAR(150) NOT NULL COMMENT 'e.g. 2083 Grade 11 Science First Merit List',
  `applying_grade` VARCHAR(50) NOT NULL,
  `cutoff_score` DECIMAL(5, 2) NOT NULL,
  `total_quota` INT UNSIGNED NOT NULL DEFAULT 60,
  `published_date` DATE NOT NULL,
  `is_published` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. In-App Notification Center
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `branch_id` INT UNSIGNED NULL,
  `user_id` INT UNSIGNED NULL COMMENT 'Target user, or NULL for broadcast',
  `role_id` INT UNSIGNED NULL COMMENT 'Target role or NULL',
  `title` VARCHAR(200) NOT NULL,
  `body` TEXT NOT NULL,
  `type` ENUM('academic', 'fee', 'attendance', 'transport', 'system', 'circular') DEFAULT 'academic',
  `is_read` TINYINT(1) DEFAULT 0,
  `action_url` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_unread` (`user_id`, `is_read`, `created_at`),
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

