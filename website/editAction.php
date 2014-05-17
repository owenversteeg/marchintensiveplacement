<?php
if (!file_exists('data/classes.json') || !file_exists('data/students.json') || !file_exists('data/studentsNotPlaced.json')) {
	echo "Please generate your data files";
	exit;
}
$classes = json_decode(file_get_contents('data/classes.json'),true);
if (@$_GET['operation'] == 'add') {
	if (@$_GET['user'] != "") {
		if (@$_GET['class'] != "") {
			if (!in_array(@$_GET['user'], $classes[@$_GET['class']])) {
				push_array($classes[@$_GET['class']],@$_GET['user']);
			} else {
				$error = "Student already in class";
			}
		} else {
			$error = "No class sent (GET CLASS)";
		}
	} else {
		$error = "No user sent (GET USER)";
	}
} else {
	$error = "No operation set (GET OPERATION)";
}
if (@$error != "") {
	echo $error;
	echo '<br><br><a href="/marchintensive/index.php">Click here to go back</a>';
} else {
	file_put_contents('data/classes.json', json_encode($classes));
	header('Location:/marchintensive/index.php');
}
?>