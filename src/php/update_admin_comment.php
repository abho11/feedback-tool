<?php


header('Content-Type: application/json');
include 'database_connection.php'; 

$ticketNumber = $_POST['ticketNumber'] ?? '';
$comment = $_POST['comment'] ?? '';
$author = "Admin"; 
$timestamp = date('Y-m-d H:i:s'); 

// Validate input
if (empty($ticketNumber) || empty($comment)) {
    echo json_encode(['success' => false, 'message' => 'Ticket number and comment are required.']);
    exit;
}

// Fetch existing comments
$stmt = $pdo->prepare("SELECT comments FROM feedbacks WHERE ticket_number = ?");
$stmt->execute([$ticketNumber]);
$result = $stmt->fetch();

$comments = $result ? json_decode((string)$result['comments'], true) : [];
$comments[] = ['author' => $author, 'text' => $comment, 'timestamp' => $timestamp];

// Update the database with the new comments list
$updateStmt = $pdo->prepare("UPDATE feedbacks SET comments = ? WHERE ticket_number = ?");
$success = $updateStmt->execute([json_encode($comments), $ticketNumber]);

if ($success) {
    echo json_encode(['success' => true, 'message' => 'Comment updated successfully.', 'comments' => $comments]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to update comment.']);
}
?>