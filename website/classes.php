<?php
if (!file_exists('data/classes.json')) {
	echo "Please generate your data files";
	exit;
} else {
	$classes = json_decode(file_get_contents('data/classes.json'),true);
}
?>
<!DOCTYPE html>
<html>
<head>
	<title>March Intensive</title>
	<link rel="stylesheet" href="css/custom.css">
	<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css">
	<script src="//code.jquery.com/jquery-1.11.0.min.js"></script>
	<script type="text/javascript" src="//netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js"></script>
</head>
<body>
	<div id="container" class="container">
		<?php
		foreach ($classes as $classKey => $class) {
			?>
			<p style="background:#89d084">&nbsp;</p>
			<p>
				<span style="font-size:12.0pt;font-family:Arial Black;color:#039c08">
					<?php echo $class["displayname"]; ?>
				</span>
				<span style="font-size:12.0pt;font-family:Arial Black">
					<br>
				</span>
				<span style="font-size:9.0pt;font-family:Arial Black;color:#74d033">
					INSTRUCTOR(S)&nbsp;
				</span>
				<b>
					<i>
						<span style="font-size:9.0pt;font-family:Arial">
							NA
						</span>
					</i>
				</b>
				<b>
					<i>
						<span style="font-size:9.0pt;font-family:Arial">
							<br>
						</span>
					</i>
				</b>
				<span style="font-size:9.0pt;font-family:Arial Black;color:#74d033">
					LOCATION(S)&nbsp;
				</span>
				<span style="font-size:9.0pt;font-family:Arial">
					NA
				</span>
				<span style="font-size:9.0pt;font-family:Arial">
					<br>
				</span>
				<span style="font-size:9.0pt;font-family:Arial Black;color:#74d033">
					READING(S)&nbsp;
				</span>
				<span style="font-size:9.0pt;font-family:Arial">
					NA
				</span>
				<span style="font-size:9.0pt;font-family:Arial">
					<br>
				</span>
				<span style="font-size:9.0pt;font-family:Arial Black;color:#74d033">
					TIME
				</span>
				<span style="font-size:9.0pt;font-family:Arial">
					&nbsp;&nbsp; <?php echo strtoupper($class["type"]); ?>&nbsp;&nbsp;&nbsp;&nbsp;
				</span>
				<span style="font-size:9.0pt;font-family:Arial Black;color:#74d033">MAX #
					STUDENTS
				</span>
				<span style="font-size:9.0pt;font-family:Arial">
					&nbsp;&nbsp;<?php echo strtoupper($class["max"]); ?>&nbsp;&nbsp;&nbsp;&nbsp;
				</span>
				<span style="font-size:9.0pt;font-family:Arial Black;color:#74d033">
					COST PER STUDENT
				</span>
				<span style="font-size:9.0pt;font-family:Arial">
					&nbsp;&nbsp; $NA
					<br>
				</span>
				<span style="font-size:9.0pt;font-family:Arial Black;color:#74d033">
					DESCRIPTION
					<br>
				</span>
				<span style="font-size:9.0pt;font-family:Arial">
					<?php echo $class["description"]; ?>
				</span>
				<span style="font-size:9.0pt;font-family:Arial">
					<br>
					<br>
				</span>
			</p>
			<?php
		}
		?>
		<p style="background:#89d084">&nbsp;</p>
	</div>
</body>
</html>