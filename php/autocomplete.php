<?php
error_reporting(0);
include 'credentials.php';
$term = urldecode($_GET["term"]);

$db = new mysqli($server, $username, $password, $username);
if($db->connect_errno > 0){
    echo -1;
} else {
	$term = $term."%";
	$statement = $db->prepare("SELECT Nname FROM cards WHERE Nname LIKE ? ORDER BY Nname LIMIT 1");
	$statement -> bind_param('s', $term);
	$statement -> execute();
	$statement -> bind_result($return);
	$on = false;
	while ($statement -> fetch()) {
		$on = true;
		echo $return;
	}
	if (!$on) echo -1;
	$statement -> close();
}
$db -> close();

?>