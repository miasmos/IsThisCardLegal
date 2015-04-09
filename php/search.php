<?php
error_reporting(0);
include 'credentials.php';
$term = urldecode( $_GET["term"]);

$db = new mysqli($server, $username, $password, $username);
if($db->connect_errno > 0){
    echo -2;
} else {
	$statement = $db->prepare("SELECT `Nid`,`Nname`,`Nlegality_Block`,`Nlegality_Standard`,`Nlegality_Modern`,`Nlegality_Legacy`,`Nlegality_Vintage`,`Nlegality_Highlander`,`Nlegality_Tiny_Leaders_Commander`,`Nlegality_Commander`,`Nlegality_Peasant`,`Nlegality_Pauper` FROM `cards` WHERE `Nname`=? LIMIT 1");
	$statement -> bind_param('s', $term);
	$statement -> execute();
	$statement -> bind_result($id,$name,$block,$standard,$modern,$legacy,$vintage,$highlander,$tiny,$commander,$peasant,$pauper);
	$on = false;
	while ($statement -> fetch()) {
		$on = true;
		$return = array(
			name => $name,
			legalities => array(
				b => $block,
				s => $standard,
				m => $modern,
				l => $legacy,
				v => $vintage,
				h => $highlander,
				t => $tiny,
				c => $commander,
				p => $peasant,
				a => $pauper
			)
		);
		echo json_encode($return);
	}
	if (!$on) echo -1;
	$statement -> close();
}
$db -> close();

?>