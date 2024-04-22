<?php
include 'database_connection.php';
header('Content-Type: application/json');

try {
    $stmt = $pdo->query("SELECT status, COUNT(*) as count FROM feedbacks GROUP BY status");
    $counts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $total = 0;
    $open = 0;
    $closed = 0;

    foreach ($counts as $count) {
        $total += $count['count'];
        if ($count['status'] === 'Open') {
            $open = $count['count'];
        } elseif ($count['status'] === 'Closed') {
            $closed = $count['count'];
        }
    }

    echo json_encode(['success' => true, 'total' => $total, 'open' => $open, 'closed' => $closed]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
