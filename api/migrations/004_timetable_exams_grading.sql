-- ========================================================
-- MIGRATION 004: Timetable, Clash Detection, Exams, Marks & Report Cards
-- ========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Subjects Directory (Nepal CDC / NEB Curriculum Standards)
CREATE TABLE IF NOT EXISTS `subjects` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `code` VARCHAR(50) NOT NULL COMMENT 'e.g. NEP-101, ENG-102, COMP-MTH-103, OPT-MTH-104, SCI-105',
  `name` VARCHAR(150) NOT NULL,
  `theory_full_marks` DECIMAL(5, 2) DEFAULT 75.00,
  `theory_pass_marks` DECIMAL(5, 2) DEFAULT 27.00,
  `practical_full_marks` DECIMAL(5, 2) DEFAULT 25.00,
  `practical_pass_marks` DECIMAL(5, 2) DEFAULT 10.00,
  `credit_hours` DECIMAL(3, 1) DEFAULT 4.0,
  `is_optional` TINYINT(1) DEFAULT 0,
  UNIQUE KEY `unique_school_subject_code` (`school_id`, `code`),
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Class Subject Assignments
CREATE TABLE IF NOT EXISTS `class_subjects` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `branch_id` INT UNSIGNED NULL,
  `class_id` INT UNSIGNED NOT NULL,
  `section_id` INT UNSIGNED NULL,
  `subject_id` INT UNSIGNED NOT NULL,
  `teacher_id` INT UNSIGNED NULL COMMENT 'Assigned subject instructor',
  UNIQUE KEY `unique_class_section_subject` (`class_id`, `section_id`, `subject_id`),
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Timetable Slots with Built-In Clash Detection
CREATE TABLE IF NOT EXISTS `timetable_slots` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `branch_id` INT UNSIGNED NOT NULL,
  `class_id` INT UNSIGNED NOT NULL,
  `section_id` INT UNSIGNED NOT NULL,
  `subject_id` INT UNSIGNED NOT NULL,
  `teacher_id` INT UNSIGNED NOT NULL,
  `room_no` VARCHAR(50) NOT NULL,
  `day_of_week` ENUM('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,
  `period_no` TINYINT UNSIGNED NOT NULL COMMENT 'Period 1 to 8',
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  
  -- Prevent teacher being double-booked for the same period in the same branch
  UNIQUE KEY `unique_teacher_period_clash` (`branch_id`, `teacher_id`, `day_of_week`, `period_no`),
  -- Prevent room being double-booked for the same period in the same branch
  UNIQUE KEY `unique_room_period_clash` (`branch_id`, `room_no`, `day_of_week`, `period_no`),
  -- Prevent class-section having multiple lessons in same period
  UNIQUE KEY `unique_class_period_slot` (`section_id`, `day_of_week`, `period_no`),
  
  FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Examinations Master Registry
CREATE TABLE IF NOT EXISTS `exams` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `academic_year_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(150) NOT NULL COMMENT 'e.g. First Terminal Assessment, SEE Pre-Board Examination',
  `term` ENUM('unit_test', 'first_term', 'second_term', 'pre_board', 'final_term') NOT NULL,
  `start_date_ad` DATE NOT NULL,
  `end_date_ad` DATE NOT NULL,
  `start_date_bs` VARCHAR(20) NOT NULL,
  `end_date_bs` VARCHAR(20) NOT NULL,
  `is_published` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Student Exam Marks Entry
CREATE TABLE IF NOT EXISTS `student_marks` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `exam_id` INT UNSIGNED NOT NULL,
  `student_id` INT UNSIGNED NOT NULL,
  `subject_id` INT UNSIGNED NOT NULL,
  `theory_obtained` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  `practical_obtained` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  `total_obtained` DECIMAL(5, 2) GENERATED ALWAYS AS (theory_obtained + practical_obtained) VIRTUAL,
  `grade_letter` VARCHAR(5) NOT NULL DEFAULT 'NG' COMMENT 'A+, A, B+, B, C+, C, D, NG',
  `gpa_point` DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
  `is_absent` TINYINT(1) DEFAULT 0,
  `remarks` VARCHAR(255) NULL,
  `entered_by` INT UNSIGNED NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_student_exam_subject` (`exam_id`, `student_id`, `subject_id`),
  FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`entered_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Compiled Official Report Cards
CREATE TABLE IF NOT EXISTS `report_cards` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `branch_id` INT UNSIGNED NULL,
  `exam_id` INT UNSIGNED NOT NULL,
  `student_id` INT UNSIGNED NOT NULL,
  `total_marks_obtained` DECIMAL(6, 2) NOT NULL,
  `total_full_marks` DECIMAL(6, 2) NOT NULL,
  `percentage` DECIMAL(5, 2) NOT NULL,
  `final_gpa` DECIMAL(3, 2) NOT NULL,
  `final_grade` VARCHAR(5) NOT NULL,
  `rank_in_class` INT UNSIGNED NULL,
  `attendance_days_present` INT UNSIGNED DEFAULT 0,
  `attendance_days_total` INT UNSIGNED DEFAULT 0,
  `class_teacher_remarks` TEXT NULL,
  `principal_remarks` TEXT NULL,
  `issued_date_ad` DATE NOT NULL,
  `issued_date_bs` VARCHAR(20) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_student_exam_report` (`exam_id`, `student_id`),
  FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

