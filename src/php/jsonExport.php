<?php

$host = 'localhost:3306';  
$dbname = 'feedback-issue';
$user = 'root';
$pass = '';

$pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);


$sql = "SELECT * FROM feedbacks";
$stmt = $pdo->prepare($sql);
$stmt->execute();


$results = $stmt->fetchAll(PDO::FETCH_ASSOC);


$jsonData = json_encode($results, JSON_PRETTY_PRINT);


echo $jsonData;

// save to a file
file_put_contents('../json/feedbackData.json', $jsonData);
?>
