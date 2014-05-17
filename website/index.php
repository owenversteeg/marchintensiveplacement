<?php
if (!file_exists('data/classes.json') || !file_exists('data/students.json') || !file_exists('data/studentsNotPlaced.json')) {
	echo "Please generate your data files";
	exit;
}
?>
<!DOCTYPE html>
<html>
<head>
	<title>March Intensive</title>
	<link rel="stylesheet" href="css/font-awesome.min.css">
	<link rel="stylesheet" href="css/bootstrap.min.css">
	<link rel="stylesheet" href="css/custom.css">
	<script type="text/javascript" src="js/jquery.min.js"></script>
	<script type="text/javascript" src="js/bootstrap.min.js"></script>
</head>
<body>
	<div id="container" class="container">
		<div class="row row-margin-top row-margin-bottom">
			<div class="col-md-4 col-md-offset-4" style="text-align:center;">
				<h4>March Intensive Website Hey</h4>
			</div>
		</div>
		<div class="row row-margin-top">
			<div class="col-md-3 col-md-offset-3">
				<a href="submit.php" class="btn btn-block btn-info">Submit Your Registration Form &raquo;</a>
			</div>
			<div class="col-md-3">
				<a href="edit.php" class="btn btn-block btn-warning">Edit Placement Data &raquo;</a>
			</div>
		</div>
	</div>
</body>
</html>