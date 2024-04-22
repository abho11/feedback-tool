<?php
include 'database_connection.php';  
header('Content-Type: application/json');

// Retrieve parameters from the request
$searchQuery = $_GET['searchQuery'] ?? '';
$issueType = $_GET['issueType'] ?? '';
$userType = $_GET['userType'] ?? '';
$status = $_GET['status'] ?? '';
$sortBy = $_GET['sortBy'] ?? 'created_at DESC';  
$page = isset($_GET['page']) ? (int) $_GET['page'] : 1;  
$perPage = isset($_GET['perPage']) ? (int) $_GET['perPage'] : 10;  

// Calculate offset for SQL query
$offset = ($page - 1) * $perPage;

// Build the SQL query dynamically based on input parameters
$query = "FROM feedbacks WHERE 1=1";
$params = [];

// Search filter for email or name
if (!empty($searchQuery)) {
    $query .= " AND (email LIKE ? OR name LIKE ?)";
    $likeQuery = '%' . $searchQuery . '%';
    $params[] = $likeQuery;
    $params[] = $likeQuery;
}

// Filtering by issue type
if (!empty($issueType)) {
    $query .= " AND issue_type = ?";
    $params[] = $issueType;
}

// Filtering by user type
if (!empty($userType)) {
    $query .= " AND user_type = ?";
    $params[] = $userType;
}

// Filtering by status
if (!empty($status)) {
    $query .= " AND status = ?";
    $params[] = $status;
}

// Sorting
$query .= " ORDER BY " . $pdo->quote($sortBy);

// Count total available results
$countStmt = $pdo->prepare("SELECT COUNT(*) " . $query);
$countStmt->execute($params);
$totalRows = $countStmt->fetchColumn();

// Retrieve paginated results
$resultQuery = "SELECT * " . $query . " LIMIT :perPage OFFSET :offset";
$stmt = $pdo->prepare($resultQuery);
foreach ($params as $key => $value) {
    $stmt->bindValue($key + 1, $value);  // Bind all dynamic parameters
}
$stmt->bindValue(':perPage', $perPage, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();
$tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Return the results as JSON
if ($tickets) {
    echo json_encode([
        'success' => true,
        'tickets' => $tickets,
        'totalPages' => ceil($totalRows / $perPage),
        'currentPage' => $page,
        'totalRows' => $totalRows
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'No tickets found.']);
}
?>
