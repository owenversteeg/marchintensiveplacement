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
	<div id="container" style="margin-top:50px" class="container">
		<?php
		$classes = json_decode(file_get_contents('data/classes.json'),true);
		$students = json_decode(file_get_contents('data/students.json'),true);

		foreach ($classes as $className => $class) {
			?>
			<div class="row well">
				<div class="col-md-6">
					<?php
					echo '<h4>'.$className.'</h4>';
					?>
				</div>
				<div class="col-md-6">
					<?php
					foreach ($class['enrolled'] as $key => $student) {
						echo $student;
						?>
						<form method="post" action="editAction.php">
							<input type="hidden" name="operation" value="remove">
							<input type="hidden" name="class" value="<?php echo $className; ?>">
							<input type="hidden" name="user" value="<?php echo $student; ?>">
							<input type="submit" value="Remove" class="btn btn-xs">
						</form>
						<br>
						<?php
					}
					?>
				</div>
			</div>
			<?php
		}
		?>
	</div>
</body>
</html>