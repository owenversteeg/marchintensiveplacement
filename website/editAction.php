<?php
if (!file_exists('data/classes.json') || !file_exists('data/students.json') || !file_exists('data/studentsNotPlaced.json')) {
	echo "Please generate your data files";
	exit;
}
$classes = json_decode(file_get_contents('data/classes.json'),true);
if (@$_POST['operation'] == 'add') {
	if (@$_POST['user'] != '') {
		if (@$_POST['class'] != '') {
			if (!in_array(@$_POST['user'], $classes[@$_POST['class']]['enrolled'])) {
				array_push($classes[@$_POST['class']]['enrolled'],@$_POST['user']);
			} else {
				$error = "Student already in class";
			}
		} else {
			$error = "No class sent (POST CLASS)";
		}
	} else {
		$error = "No user sent (POST USER)";
	}
} else if (@$_POST['operation'] == 'remove') {
	if (@$_POST['user'] != '') {
		if (@$_POST['class'] != '') {
			if(($key = array_search(@$_POST['user'], $classes[@$_POST['class']]['enrolled'])) !== false) {
				array_splice($classes[@$_POST['class']]['enrolled'],$key,1);
			}
		} else {
			$error = "No class sent (POST CLASS)";
		}
	} else {
		$error = "No user sent (POST USER)";
	}
} else {
	$error = "No operation set (POST OPERATION)";
}
if (@$error != '') {
	echo $error;
} else {
	file_put_contents('data/classes.json', json_encode($classes));
	echo "TRUE";
}
?>