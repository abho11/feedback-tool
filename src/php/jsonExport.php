<?php

$host = 'q68u8b2buodpme2n.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306';
$dbname = 'kp7g0899e1xv82az';
$user = 'r6kcr8ndrbqqsbdw';
$pass = 'sd6hax1al7jfghcy';

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
