-- ============================================================================
-- Migration 007: SMS Extended Core Modules
-- 1. Front Office (Visitors, Calls, Inquiries)
-- 2. Online Courses & Live Virtual Classes (Zoom / Google Meet / Jitsi)
-- 3. Student Behavior & Conduct Tracking
-- 4. Financial Expenses & Cashflow Accounting
-- 5. Multi-System Examinations (CBSE, Standard & Online CBT Assessments)
-- 6. Staff Daily Attendance & Leave Management
-- 7. Lesson Plans & Syllabus Tracking
-- 8. Communication Notices & Internal Circulars
-- ============================================================================

-- 1. Front Office: Visitors Management
CREATE TABLE IF NOT EXISTS `front_office_visitors` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `school_id` INT UNSIGNED NOT NULL,
    `branch_id` INT UNSIGNED NULL,
    `visitor_name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(60) NOT NULL,
    `id_card_type` VARCHAR(60) NULL DEFAULT 'Citizenship',
    `id_card_number` VARCHAR(100) NULL,
    `purpose` VARCHAR(255) NOT NULL,
    `person_to_meet` VARCHAR(191) NOT NULL,
    `check_in_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `check_out_time` DATETIME NULL,
    `pass_no` VARCHAR(60) NOT NULL UNIQUE,
    `status` ENUM('checked_in', 'checked_out') NOT NULL DEFAULT 'checked_in',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_fov_school` (`school_id`, `branch_id`),
    INDEX `idx_fov_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Front Office: Phone Call Logs
CREATE TABLE IF NOT EXISTS `front_office_calls` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `school_id` INT UNSIGNED NOT NULL,
    `branch_id` INT UNSIGNED NULL,
    `caller_name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(60) NOT NULL,
    `call_type` ENUM('incoming', 'outgoing') NOT NULL DEFAULT 'incoming',
    `call_date` DATE NOT NULL,
    `duration_minutes` INT UNSIGNED NOT NULL DEFAULT 5,
    `description` TEXT NULL,
    `next_follow_up_date` DATE NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_foc_school` (`school_id`, `call_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Online Courses
CREATE TABLE IF NOT EXISTS `online_courses` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `school_id` INT UNSIGNED NOT NULL,
    `branch_id` INT UNSIGNED NULL,
    `class_id` INT UNSIGNED NOT NULL,
    `subject_id` INT UNSIGNED NOT NULL,
    `teacher_id` INT UNSIGNED NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `thumbnail_url` VARCHAR(255) NULL,
    `total_lessons` INT UNSIGNED NOT NULL DEFAULT 12,
    `course_status` ENUM('published', 'draft', 'archived') NOT NULL DEFAULT 'published',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_oc_school_class` (`school_id`, `class_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Online Live Virtual Classes
CREATE TABLE IF NOT EXISTS `online_live_classes` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `school_id` INT UNSIGNED NOT NULL,
    `branch_id` INT UNSIGNED NULL,
    `class_id` INT UNSIGNED NOT NULL,
    `subject_id` INT UNSIGNED NOT NULL,
    `teacher_id` INT UNSIGNED NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `platform` ENUM('zoom', 'google_meet', 'jitsi') NOT NULL DEFAULT 'zoom',
    `meeting_id` VARCHAR(100) NULL,
    `meeting_password` VARCHAR(100) NULL,
    `join_url` TEXT NOT NULL,
    `start_time` DATETIME NOT NULL,
    `duration_minutes` INT UNSIGNED NOT NULL DEFAULT 45,
    `status` ENUM('scheduled', 'live', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_olc_school` (`school_id`, `class_id`, `start_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Student Behavior & Conduct Tracking
CREATE TABLE IF NOT EXISTS `student_behavior_records` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `school_id` INT UNSIGNED NOT NULL,
    `branch_id` INT UNSIGNED NULL,
    `student_id` INT UNSIGNED NOT NULL,
    `incident_type` ENUM('positive', 'disciplinary', 'counseling') NOT NULL DEFAULT 'positive',
    `title` VARCHAR(255) NOT NULL,
    `points` INT NOT NULL DEFAULT 5, -- Positive (e.g. +10 for leadership) or Negative (e.g. -5 for uniform breach)
    `description` TEXT NULL,
    `action_taken` VARCHAR(255) NULL,
    `reported_by_user_id` INT UNSIGNED NOT NULL,
    `incident_date` DATE NOT NULL,
    `guardian_notified` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_sbr_student` (`school_id`, `student_id`),
    INDEX `idx_sbr_type` (`incident_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Financial Expenses & Cashflow Accounting
CREATE TABLE IF NOT EXISTS `financial_expenses` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `school_id` INT UNSIGNED NOT NULL,
    `branch_id` INT UNSIGNED NULL,
    `title` VARCHAR(255) NOT NULL,
    `category` ENUM('utilities', 'maintenance', 'salaries', 'supplies', 'events', 'academic', 'other') NOT NULL DEFAULT 'utilities',
    `amount` DECIMAL(12,2) NOT NULL,
    `payment_mode` ENUM('cash', 'bank_transfer', 'cheque', 'qr') NOT NULL DEFAULT 'cash',
    `reference_no` VARCHAR(100) NULL,
    `expense_date` DATE NOT NULL,
    `notes` TEXT NULL,
    `created_by_user_id` INT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_fe_school` (`school_id`, `branch_id`, `expense_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Multi-System Examinations & Online CBT Assessments
CREATE TABLE IF NOT EXISTS `online_assessments` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `school_id` INT UNSIGNED NOT NULL,
    `branch_id` INT UNSIGNED NULL,
    `class_id` INT UNSIGNED NOT NULL,
    `subject_id` INT UNSIGNED NOT NULL,
    `exam_system` ENUM('cbse', 'standard', 'online_quiz') NOT NULL DEFAULT 'online_quiz',
    `title` VARCHAR(255) NOT NULL,
    `total_marks` INT NOT NULL DEFAULT 50,
    `duration_minutes` INT NOT NULL DEFAULT 60,
    `pass_marks` INT NOT NULL DEFAULT 20,
    `start_time` DATETIME NOT NULL,
    `end_time` DATETIME NOT NULL,
    `questions_json` JSON NULL,
    `status` ENUM('published', 'draft', 'concluded') NOT NULL DEFAULT 'published',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_oa_school` (`school_id`, `class_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Staff Daily Attendance
CREATE TABLE IF NOT EXISTS `staff_attendance` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `school_id` INT UNSIGNED NOT NULL,
    `branch_id` INT UNSIGNED NULL,
    `staff_user_id` INT UNSIGNED NOT NULL,
    `attendance_date` DATE NOT NULL,
    `status` ENUM('present', 'absent', 'late', 'half_day', 'on_leave') NOT NULL DEFAULT 'present',
    `in_time` TIME NULL,
    `out_time` TIME NULL,
    `remarks` VARCHAR(255) NULL,
    `marked_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_staff_day_att` (`school_id`, `staff_user_id`, `attendance_date`),
    INDEX `idx_sa_date` (`school_id`, `attendance_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Staff Leaves Management
CREATE TABLE IF NOT EXISTS `staff_leaves` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `school_id` INT UNSIGNED NOT NULL,
    `branch_id` INT UNSIGNED NULL,
    `staff_user_id` INT UNSIGNED NOT NULL,
    `leave_type` ENUM('casual', 'sick', 'maternity', 'earned') NOT NULL DEFAULT 'casual',
    `from_date` DATE NOT NULL,
    `to_date` DATE NOT NULL,
    `days_count` INT UNSIGNED NOT NULL DEFAULT 1,
    `reason` TEXT NOT NULL,
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `approved_by_user_id` INT UNSIGNED NULL,
    `decision_notes` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_sl_school` (`school_id`, `staff_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Academics & Lesson Plans
CREATE TABLE IF NOT EXISTS `lesson_plans` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `school_id` INT UNSIGNED NOT NULL,
    `branch_id` INT UNSIGNED NULL,
    `class_id` INT UNSIGNED NOT NULL,
    `subject_id` INT UNSIGNED NOT NULL,
    `teacher_id` INT UNSIGNED NOT NULL,
    `week_no` INT UNSIGNED NOT NULL DEFAULT 1,
    `unit_name` VARCHAR(191) NOT NULL,
    `topic_title` VARCHAR(255) NOT NULL,
    `learning_objectives` TEXT NULL,
    `teaching_method` VARCHAR(255) NULL DEFAULT 'Interactive Class Lecture & Lab',
    `planned_date` DATE NOT NULL,
    `completion_status` ENUM('planned', 'in_progress', 'completed') NOT NULL DEFAULT 'planned',
    `completion_percentage` INT UNSIGNED NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_lp_school` (`school_id`, `class_id`, `teacher_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Communication Notices & Internal Circulars
CREATE TABLE IF NOT EXISTS `communication_notices` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `school_id` INT UNSIGNED NOT NULL,
    `branch_id` INT UNSIGNED NULL,
    `title` VARCHAR(255) NOT NULL,
    `content` TEXT NOT NULL,
    `audience` ENUM('all', 'students', 'teachers', 'parents', 'staff') NOT NULL DEFAULT 'all',
    `priority` ENUM('normal', 'high', 'urgent') NOT NULL DEFAULT 'normal',
    `is_published` TINYINT(1) NOT NULL DEFAULT 1,
    `publish_date` DATE NOT NULL,
    `attachment_url` VARCHAR(255) NULL,
    `created_by_user_id` INT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_cn_school` (`school_id`, `audience`, `publish_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

