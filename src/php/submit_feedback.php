<?php
header('Content-Type: application/json');
include 'database_connection.php';

// data from POST request
$name = $_POST['name'] ?? '';
$email = $_POST['email'] ?? '';
$phone = $_POST['phone'] ?? '';
$issueType = $_POST['issue-type'] ?? '';
$userType = $_POST['user-type'] ?? '';
$description = $_POST['description'] ?? '';

// Validate required fields
if (empty($name) || empty($email) || empty($issueType) || empty($userType) || empty($description)) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
    exit;
}

//  unique ticket number
$ticketNumber = 'TICKET-' . strtoupper(uniqid());

//  insert data
$sql = "INSERT INTO feedbacks (name, email, phone, issue_type, user_type, description, ticket_number) VALUES (?, ?, ?, ?, ?, ?, ?)";
$stmt = $pdo->prepare($sql);
$success = $stmt->execute([$name, $email, $phone, $issueType, $userType, $description, $ticketNumber]);

if ($success) {
    //  Node.js service to send email
    $url = 'http://localhost:3001/send';
    $payload = json_encode([
        "name" => $name,
        "email" => $email,
        "phone" => $phone,
        "issueType" => $issueType,
        "userType" => $userType,
        "description" => $description,
        "ticketNumber" => $ticketNumber
    ]);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type:application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    $result = curl_exec($ch);
    $err = curl_error($ch);
    curl_close($ch);

    if ($err) {
        echo json_encode(['success' => false, 'message' => 'Failed to send email.', 'error' => $err]);
    } else {
        echo json_encode(['success' => true, 'message' => 'Feedback submitted successfully.', 'ticketNumber' => $ticketNumber]);
    }
    
} else {
    echo json_encode(['success' => false, 'message' => 'Error submitting feedback.']);
}
?>