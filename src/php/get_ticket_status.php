<?php
header('Content-Type: application/json');
include 'database_connection.php';

$ticketNumber = $_POST['ticketNumber'] ?? '';

if (empty($ticketNumber)) {
    echo json_encode(['success' => false, 'message' => 'Ticket number is required']);
    exit;
}

$stmt = $pdo->prepare("SELECT name, email, issue_type, user_type, description, created_at, status, comments FROM feedbacks WHERE ticket_number = ?");
$stmt->execute([$ticketNumber]);
$ticket = $stmt->fetch(PDO::FETCH_ASSOC);

if ($ticket) {
    echo json_encode(['success' => true, 'ticket' => $ticket]);
} else {
    echo json_encode(['success' => false, 'message' => 'Ticket not found']);
}
?>