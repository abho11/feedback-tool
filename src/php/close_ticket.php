<?php
include 'database_connection.php';
header('Content-Type: application/json');

$ticketNumber = $_POST['ticketNumber'] ?? '';

if (empty($ticketNumber)) {
    echo json_encode(['success' => false, 'message' => 'Ticket number is required.']);
    exit;
}

// Fetch ticket details including comments before closing for email usage
$stmt = $pdo->prepare("SELECT name, email, description, comments FROM feedbacks WHERE ticket_number = ?");
$stmt->execute([$ticketNumber]);
$ticket = $stmt->fetch();

if (!$ticket) {
    echo json_encode(['success' => false, 'message' => 'Ticket not found.']);
    exit;
}

// Update the ticket to close it
$updateStmt = $pdo->prepare("UPDATE feedbacks SET status = 'Closed' WHERE ticket_number = ?");
$success = $updateStmt->execute([$ticketNumber]);

if ($success) {
    // Setup cURL to call Node.js service to send email
    $curl = curl_init('http://localhost:3001/send-close-notification');
    $payload = json_encode([
        'name' => $ticket['name'],
        'email' => $ticket['email'],
        'ticketNumber' => $ticketNumber,
        'description' => $ticket['description'],
        'comments' => $ticket['comments'] // comments are stored as a JSON string
    ]);

    curl_setopt($curl, CURLOPT_POST, true);
    curl_setopt($curl, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($curl, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

    $result = curl_exec($curl);
    $err = curl_error($curl);
    curl_close($curl);

    if ($err) {
        echo json_encode(['success' => false, 'message' => 'Failed to send closure email.', 'error' => $err]);
    } else {
        $response = json_decode($result, true);
        if ($response && $response['success']) {
            echo json_encode(['success' => true, 'message' => 'Ticket closed successfully and email sent.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Email sending failed.', 'info' => $response]);
        }
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to close the ticket.']);
}
?>
