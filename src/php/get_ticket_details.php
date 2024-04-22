
<?php
include 'database_connection.php';
header('Content-Type: application/json');

$ticketNumber = $_GET['ticketNumber'] ?? '';

$stmt = $pdo->prepare("SELECT * FROM feedbacks WHERE ticket_number = ?");
$stmt->execute([$ticketNumber]);
$ticket = $stmt->fetch(PDO::FETCH_ASSOC);

if ($ticket) {
    echo json_encode(['success' => true, 'ticket' => $ticket]);
} else {
    echo json_encode(['success' => false, 'message' => 'Ticket not found.']);
}
?>