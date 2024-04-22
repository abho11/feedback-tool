<?php
include 'database_connection.php';
header('Content-Type: application/json');

$searchQuery = $_GET['searchQuery'] ?? '';
$issueType = $_GET['issueType'] ?? '';
$userType = $_GET['userType'] ?? '';
$status = $_GET['status'] ?? '';
$sortBy = $_GET['sortBy'] ?? '';
$page = $_GET['page'] ?? 1; 
$perPage = $_GET['perPage'] ?? 10; 

$page = max(1, intval($page));
$perPage = in_array($perPage, [5, 10, 20, 30, 50, 100]) ? intval($perPage) : 10;

// Calculate offset for pagination
$offset = ($page - 1) * $perPage;

$sql = "FROM feedbacks WHERE 1=1";
$params = [];

if (!empty($searchQuery)) {
    $sql .= " AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR ticket_number LIKE ?)";
    $likeQuery = '%' . $searchQuery . '%';
    array_push($params, $likeQuery, $likeQuery, $likeQuery, $likeQuery);
}
if (!empty($issueType)) {
    $sql .= " AND issue_type = ?";
    $params[] = $issueType;
}
if (!empty($userType)) {
    $sql .= " AND user_type = ?";
    $params[] = $userType;
}
if (!empty($status)) {
    $sql .= " AND status = ?";
    $params[] = $status;
}

// Add sorting
switch ($sortBy) {
    case 'name_asc': $sql .= " ORDER BY name ASC"; break;
    case 'name_desc': $sql .= " ORDER BY name DESC"; break;
    case 'email_asc': $sql .= " ORDER BY email ASC"; break;
    case 'email_desc': $sql .= " ORDER BY email DESC"; break;
    case 'date_asc': $sql .= " ORDER BY created_at ASC"; break;
    case 'date_desc': $sql .= " ORDER BY created_at DESC"; break;
    default: $sql .= " ORDER BY created_at DESC"; // Default sorting
}


$stmt = $pdo->prepare("SELECT COUNT(*) " . $sql);
$stmt->execute($params);
$totalTickets = $stmt->fetchColumn();

// Prepare the paginated SQL
$paginatedSql = "SELECT * " . $sql . " LIMIT ? OFFSET ?";
$stmt = $pdo->prepare($paginatedSql);

// Bind parameters for WHERE clause
foreach ($params as $i => $param) {
    $stmt->bindValue($i + 1, $param);
}
// Bind parameters for LIMIT and OFFSET explicitly specifying the parameter type
$stmt->bindValue(count($params) + 1, $perPage, PDO::PARAM_INT);
$stmt->bindValue(count($params) + 2, $offset, PDO::PARAM_INT);

$stmt->execute();
$tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);

if ($tickets) {
    echo json_encode([
        'success' => true,
        'tickets' => $tickets,
        'totalPages' => ceil($totalTickets / $perPage),
        'currentPage' => $page
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'No tickets found.']);
}
?>
