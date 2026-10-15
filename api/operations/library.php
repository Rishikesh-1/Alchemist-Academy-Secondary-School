<?php
// api/operations/library.php
// Library catalog, book issue/return tracking, and overdue fine engine
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth_guard.php';

$user = requireAuth($pdo);
$schoolId = (int)$user['school_id'];
$branchId = !empty($_GET['branch_id']) ? (int)$_GET['branch_id'] : ($user['branch_id'] ? (int)$user['branch_id'] : 1);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // 1. Book Catalog
    $booksStmt = $pdo->prepare("SELECT * FROM library_books WHERE school_id = :school_id ORDER BY title ASC");
    $booksStmt->execute([':school_id' => $schoolId]);
    $books = $booksStmt->fetchAll();

    // 2. Active Issues
    $issuesStmt = $pdo->prepare("
        SELECT 
            li.*,
            b.title as book_title,
            b.isbn,
            b.author,
            s.first_name,
            s.last_name,
            s.admission_no,
            s.guardian_phone,
            c.name as class_name,
            DATEDIFF(CURDATE(), li.due_date) as overdue_days
        FROM library_issues li
        JOIN library_books b ON li.book_id = b.id
        JOIN students s ON li.student_id = s.id
        LEFT JOIN classes c ON s.class_id = c.id
        WHERE li.school_id = :school_id
        ORDER BY li.issue_date DESC LIMIT 100
    ");
    $issuesStmt->execute([':school_id' => $schoolId]);
    $issues = $issuesStmt->fetchAll();

    jsonResponse(true, 'Library inventory and circulation retrieved.', [
        'books'  => $books,
        'issues' => $issues,
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAuth($pdo, ['superadmin', 'admin', 'principal', 'librarian']);

    $input = getJsonInput();
    $action = $input['action'] ?? 'issue_book';

    if ($action === 'add_book') {
        $title = trim((string)($input['title'] ?? ''));
        $author = trim((string)($input['author'] ?? ''));
        $isbn = trim((string)($input['isbn'] ?? ''));
        $category = trim((string)($input['category'] ?? 'General'));
        $copies = (int)($input['copies'] ?? 1);
        $shelf = trim((string)($input['shelf_location'] ?? 'Stack A'));

        if (empty($title)) {
            jsonResponse(false, 'Book title is required.', null, 400);
        }

        $ins = $pdo->prepare("
            INSERT INTO library_books (school_id, branch_id, title, author, isbn, category, total_copies, available_copies, shelf_location)
            VALUES (:school_id, :branch_id, :title, :author, :isbn, :cat, :copies, :copies, :shelf)
        ");
        $ins->execute([
            ':school_id' => $schoolId,
            ':branch_id' => $branchId,
            ':title'     => $title,
            ':author'    => $author,
            ':isbn'      => $isbn,
            ':cat'       => $category,
            ':copies'    => $copies,
            ':shelf'     => $shelf,
        ]);

        jsonResponse(true, "Book '{$title}' added to catalog.", ['book_id' => (int)$pdo->lastInsertId()]);
    }

    if ($action === 'issue_book') {
        $bookId = (int)($input['book_id'] ?? 0);
        $studentId = (int)($input['student_id'] ?? 0);
        $dueDays = (int)($input['due_days'] ?? 14);

        if (!$bookId || !$studentId) {
            jsonResponse(false, 'book_id and student_id are required.', null, 400);
        }

        // Check availability
        $chk = $pdo->prepare("SELECT available_copies, title FROM library_books WHERE id = :id AND school_id = :s");
        $chk->execute([':id' => $bookId, ':s' => $schoolId]);
        $book = $chk->fetch();

        if (!$book || (int)$book['available_copies'] <= 0) {
            jsonResponse(false, 'No available copies of this book in stock.', null, 400);
        }

        $pdo->beginTransaction();
        try {
            $iss = $pdo->prepare("
                INSERT INTO library_issues (school_id, book_id, student_id, issue_date, due_date, status, issued_by_user_id)
                VALUES (:school_id, :book_id, :student_id, CURDATE(), DATE_ADD(CURDATE(), INTERVAL :days DAY), 'issued', :user_id)
            ");
            $iss->execute([
                ':school_id'  => $schoolId,
                ':book_id'    => $bookId,
                ':student_id' => $studentId,
                ':days'       => $dueDays,
                ':user_id'    => (int)$user['id'],
            ]);

            // Decrement available copies
            $pdo->prepare("UPDATE library_books SET available_copies = available_copies - 1 WHERE id = :id")
                ->execute([':id' => $bookId]);

            $pdo->commit();

            logAuditAction(
                $pdo,
                $schoolId,
                $branchId,
                (int)$user['id'],
                $user['name'],
                $user['role_slug'],
                'LIBRARY_BOOK_ISSUE',
                'library_issues',
                (string)$bookId,
                null,
                ['book_title' => $book['title'], 'student_id' => $studentId, 'due_days' => $dueDays]
            );

            jsonResponse(true, "Book '{$book['title']}' issued successfully.");
        } catch (Exception $e) {
            $pdo->rollBack();
            jsonResponse(false, 'Failed to issue book: ' . $e->getMessage(), null, 500);
        }
    }

    if ($action === 'return_book') {
        $issueId = (int)($input['issue_id'] ?? 0);
        $finePaid = (float)($input['fine_paid'] ?? 0);

        if (!$issueId) {
            jsonResponse(false, 'issue_id is required.', null, 400);
        }

        $issChk = $pdo->prepare("SELECT * FROM library_issues WHERE id = :id AND school_id = :s");
        $issChk->execute([':id' => $issueId, ':s' => $schoolId]);
        $issRec = $issChk->fetch();

        if (!$issRec) {
            jsonResponse(false, 'Issue record not found.', null, 404);
        }

        $pdo->beginTransaction();
        try {
            $pdo->prepare("
                UPDATE library_issues 
                SET return_date = CURDATE(), status = 'returned', fine_amount = :fine, fine_paid = :fine 
                WHERE id = :id
            ")->execute([':fine' => $finePaid, ':id' => $issueId]);

            $pdo->prepare("UPDATE library_books SET available_copies = available_copies + 1 WHERE id = :id")
                ->execute([':id' => $issRec['book_id']]);

            $pdo->commit();

            jsonResponse(true, 'Book returned successfully.');
        } catch (Exception $e) {
            $pdo->rollBack();
            jsonResponse(false, 'Failed to return book: ' . $e->getMessage(), null, 500);
        }
    }
}

jsonResponse(false, 'Method not allowed.', null, 405);
