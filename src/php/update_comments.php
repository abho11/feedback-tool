<?php
header('Content-Type: application/json');
include 'database_connection.php'; 

$ticketNumber = $_POST['ticketNumber'] ?? '';
$newComment = $_POST['comment'] ?? '';

// Validate input
if (empty($ticketNumber) || empty($newComment)) {
    echo json_encode(['success' => false, 'message' => 'Ticket number and comment are required.']);
    exit;
}

// Fetch existing comments and user's name from the feedbacks table
$stmt = $pdo->prepare("SELECT comments, name FROM feedbacks WHERE ticket_number = ?");
$stmt->execute([$ticketNumber]);
$result = $stmt->fetch();

if ($result) {
    $existingComments = $result['comments'] ? json_decode($result['comments'], true) : [];
    $userName = $result['name'] ?? 'Anonymous'; 

    $newEntry = [
        'author' => $userName,  // Use actual user's name from the feedback record
        'text' => $newComment,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    $existingComments[] = $newEntry; // Append new comment

    // Update the database with the new comments list
    $updateStmt = $pdo->prepare("UPDATE feedbacks SET comments = ? WHERE ticket_number = ?");
    $updateSuccess = $updateStmt->execute([json_encode($existingComments), $ticketNumber]);

    if ($updateSuccess) {
        echo json_encode(['success' => true, 'message' => 'Comment updated successfully.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update comment.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Ticket not found.']);
}
?>