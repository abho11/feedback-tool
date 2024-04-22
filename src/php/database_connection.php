<?php

$host = 'q68u8b2buodpme2n.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306';
$dbname = 'kp7g0899e1xv82az';
$user = 'r6kcr8ndrbqqsbdw';
$pass = 'sd6hax1al7jfghcy';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Could not connect to the database $dbname :" . $e->getMessage());
}
?>