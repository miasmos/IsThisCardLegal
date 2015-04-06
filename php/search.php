<?php
error_reporting(0);
include 'credentials.php';
$term = urldecode( $_GET["term"]);

$db = new mysqli($server, $username, $password, $username);
if($db->connect_errno > 0){
    echo -2;
} else {
	$statement = $db->prepare("SELECT `Nid`,`Nname`,`Nlegality_Block`,`Nlegality_Standard`,`Nlegality_Modern`,`Nlegality_Legacy`,`Nlegality_Vintage`,`Nlegality_Commander` FROM `Ncards` WHERE `Nname`=? LIMIT 1");
	$statement -> bind_param('s', $term);
	$statement -> execute();
	$statement -> bind_result($id,$name,$block,$standard,$modern,$legacy,$vintage,$commander);
	$on = false;
	while ($statement -> fetch()) {
		$on = true;
		$return = array(
			id => $id,
			name => $name,
			legalities => array(
				block => intval($block),
				standard => intval($standard),
				modern => intval($modern),
				legacy => intval($legacy),
				vintage => intval($vintage),
				commander => intval($commander)
			)
		);
		echo json_encode($return);
	}
	if (!$on) echo -1;
	$statement -> close();
}
$db -> close();

?>