<?php
// api/exams/index.php
// Examination setup, student mark entry, and official grading engine with audit logs
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth_guard.php';

$user = requireAuth($pdo);
$schoolId = (int)$user['school_id'];
$branchId = !empty($_GET['branch_id']) ? (int)$_GET['branch_id'] : ($user['branch_id'] ? (int)$user['branch_id'] : 1);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $examId = !empty($_GET['exam_id']) ? (int)$_GET['exam_id'] : null;
    $classId = !empty($_GET['class_id']) ? (int)$_GET['class_id'] : null;
    $subjectId = !empty($_GET['subject_id']) ? (int)$_GET['subject_id'] : null;

    // List all exams
    $examsStmt = $pdo->prepare("
        SELECT e.*, ay.name as academic_year_name 
        FROM exams e
        LEFT JOIN academic_years ay ON e.academic_year_id = ay.id
        WHERE e.school_id = :school_id
        ORDER BY e.start_date DESC
    ");
    $examsStmt->execute([':school_id' => $schoolId]);
    $exams = $examsStmt->fetchAll();

    $marks = [];
    if ($examId && $classId && $subjectId) {
        $marksStmt = $pdo->prepare("
            SELECT 
                s.id as student_id,
                s.admission_no,
                s.roll_no,
                s.first_name,
                s.last_name,
                COALESCE(sm.theory_marks, 0) as theory_marks,
                COALESCE(sm.practical_marks, 0) as practical_marks,
                COALESCE(sm.total_marks, 0) as total_marks,
                sm.grade_letter,
                sm.grade_point,
                sm.remarks,
                sm.is_absent
            FROM students s
            LEFT JOIN student_marks sm ON sm.student_id = s.id 
                AND sm.exam_id = :exam_id 
                AND sm.subject_id = :subject_id
            WHERE s.school_id = :school_id AND s.class_id = :class_id AND s.status = 'active'
            ORDER BY s.roll_no ASC, s.first_name ASC
        ");
        $marksStmt->execute([
            ':exam_id'    => $examId,
            ':subject_id' => $subjectId,
            ':school_id'  => $schoolId,
            ':class_id'   => $classId,
        ]);
        $marks = $marksStmt->fetchAll();
    }

    jsonResponse(true, 'Exams and grading details retrieved.', [
        'exams' => $exams,
        'marks' => $marks,
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAuth($pdo, ['superadmin', 'admin', 'principal', 'teacher', 'academic']);

    $input = getJsonInput();
    $action = $input['action'] ?? 'save_marks';

    if ($action === 'create_exam') {
        $name = trim((string)($input['name'] ?? ''));
        $examType = trim((string)($input['exam_type'] ?? 'terminal'));
        $term = trim((string)($input['term'] ?? 'First Term'));
        $startDate = trim((string)($input['start_date'] ?? date('Y-m-d')));
        $endDate = trim((string)($input['end_date'] ?? date('Y-m-d')));

        if (empty($name)) {
            jsonResponse(false, 'Exam title/name is required.', null, 400);
        }

        $ayStmt = $pdo->prepare("SELECT id FROM academic_years WHERE school_id = :s AND is_current = 1 LIMIT 1");
        $ayStmt->execute([':s' => $schoolId]);
        $ayId = (int)$ayStmt->fetchColumn() ?: null;

        $ins = $pdo->prepare("
            INSERT INTO exams (school_id, branch_id, academic_year_id, name, exam_type, term, start_date, end_date, status)
            VALUES (:school_id, :branch_id, :ay_id, :name, :type, :term, :start, :end, 'scheduled')
        ");
        $ins->execute([
            ':school_id' => $schoolId,
            ':branch_id' => $branchId,
            ':ay_id'     => $ayId,
            ':name'      => $name,
            ':type'      => $examType,
            ':term'      => $term,
            ':start'     => $startDate,
            ':end'       => $endDate,
        ]);

        $newExamId = (int)$pdo->lastInsertId();

        logAuditAction(
            $pdo,
            $schoolId,
            $branchId,
            (int)$user['id'],
            $user['name'],
            $user['role_slug'],
            'EXAM_CREATE',
            'exams',
            (string)$newExamId,
            null,
            ['name' => $name, 'term' => $term]
        );

        jsonResponse(true, "Exam {$name} created successfully.", ['exam_id' => $newExamId]);
    }

    if ($action === 'save_marks') {
        $examId = !empty($input['exam_id']) ? (int)$input['exam_id'] : null;
        $classId = !empty($input['class_id']) ? (int)$input['class_id'] : null;
        $subjectId = !empty($input['subject_id']) ? (int)$input['subject_id'] : null;
        $entries = $input['entries'] ?? []; // [{ student_id, theory, practical, is_absent, remarks }]

        if (!$examId || !$classId || !$subjectId || !is_array($entries)) {
            jsonResponse(false, 'exam_id, class_id, subject_id, and entries array are required.', null, 400);
        }

        // Helper function for Nepal CDC / NEB grading scale
        $calculateGrade = function(float $total): array {
            if ($total >= 90) return ['A+', 4.0, 'Outstanding'];
            if ($total >= 80) return ['A',  3.6, 'Excellent'];
            if ($total >= 70) return ['B+', 3.2, 'Very Good'];
            if ($total >= 60) return ['B',  2.8, 'Good'];
            if ($total >= 50) return ['C+', 2.4, 'Satisfactory'];
            if ($total >= 40) return ['C',  2.0, 'Acceptable'];
            if ($total >= 35) return ['D',  1.6, 'Basic'];
            return ['NG', 0.0, 'Not Graded'];
        };

        $pdo->beginTransaction();

        try {
            $upsertMark = $pdo->prepare("
                INSERT INTO student_marks 
                (school_id, exam_id, student_id, class_id, subject_id, theory_marks, practical_marks, total_marks, grade_letter, grade_point, remarks, is_absent, entered_by_user_id)
                VALUES 
                (:school_id, :exam_id, :student_id, :class_id, :subject_id, :theory, :practical, :total, :grade, :gp, :remarks, :is_absent, :entered_by)
                ON DUPLICATE KEY UPDATE 
                    theory_marks = VALUES(theory_marks),
                    practical_marks = VALUES(practical_marks),
                    total_marks = VALUES(total_marks),
                    grade_letter = VALUES(grade_letter),
                    grade_point = VALUES(grade_point),
                    remarks = VALUES(remarks),
                    is_absent = VALUES(is_absent),
                    entered_by_user_id = VALUES(entered_by_user_id)
            ");

            $count = 0;
            foreach ($entries as $e) {
                $studentId = (int)($e['student_id'] ?? 0);
                if (!$studentId) continue;

                $isAbsent = !empty($e['is_absent']) ? 1 : 0;
                $theory = $isAbsent ? 0.0 : (float)($e['theory_marks'] ?? 0);
                $practical = $isAbsent ? 0.0 : (float)($e['practical_marks'] ?? 0);
                $total = $theory + $practical;

                [$grade, $gp, $gradeRemarks] = $isAbsent ? ['ABS', 0.0, 'Absent'] : $calculateGrade($total);
                $remarks = !empty($e['remarks']) ? trim((string)$e['remarks']) : $gradeRemarks;

                $upsertMark->execute([
                    ':school_id'   => $schoolId,
                    ':exam_id'     => $examId,
                    ':student_id'  => $studentId,
                    ':class_id'    => $classId,
                    ':subject_id'  => $subjectId,
                    ':theory'      => $theory,
                    ':practical'   => $practical,
                    ':total'       => $total,
                    ':grade'       => $grade,
                    ':gp'          => $gp,
                    ':remarks'     => $remarks,
                    ':is_absent'   => $isAbsent,
                    ':entered_by'  => (int)$user['id'],
                ]);

                $count++;
            }

            $pdo->commit();

            logAuditAction(
                $pdo,
                $schoolId,
                $branchId,
                (int)$user['id'],
                $user['name'],
                $user['role_slug'],
                'STUDENT_MARKS_SAVE',
                'student_marks',
                (string)$examId,
                null,
                ['exam_id' => $examId, 'subject_id' => $subjectId, 'entries_count' => $count]
            );

            jsonResponse(true, "Successfully saved marks for {$count} students with CDC grade calculation.", [
                'entries_saved' => $count,
                'exam_id'       => $examId,
                'subject_id'    => $subjectId,
            ]);

        } catch (Exception $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            jsonResponse(false, 'Failed to save marks: ' . $e->getMessage(), null, 500);
        }
    }
}

jsonResponse(false, 'Method not allowed.', null, 405);

