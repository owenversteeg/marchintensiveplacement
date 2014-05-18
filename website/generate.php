<?php
if (!file_exists('data/classes.json') || !file_exists('data/students.json') || !file_exists('data/studentsNotPlaced.json')) {
	echo "Please generate your data files";
	exit;
} else {
	$message=shell_exec("sh /www/March-Intensive-Placement/generate.sh 2>&1");
	print_r($message);
}
?>