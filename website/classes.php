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
	<style>
		.divider {
			background:#89d084;
		}
		.classname {
			font-size: 12.0pt;
			font-family:Arial Black;
			color: #039c08;
		}
		.header {
			font-size:9.0pt;
			font-family:Arial Black;
			color:#74d033;
		}
		.header.item {
			color:black;
			font-weight: heavy;
			font-style: italic;
		}
	</style>
</head>
<body>
	<div id="container" class="container">
		<?php
		$doneFirstLoop = false;
		foreach ($classes as $classKey => $class) {
			if (!$doneFirstLoop) {
				$doneFirstLoop = true;
			} else {
				?>
				<hr>
				<?php
			}
			?>
			<p>
				<span class="classname">
					<?php echo $class["displayname"]; ?>
				</span>
				<div class="row">
					<div class="col-md-2">
						<div class="header">
							INSTRUCTORS(S)
						</div>
					</div>
					<div class="col-md-10">
						<div class="item header">
							<?php
							if (count($class["instructors"]) != 0) {
								foreach ($class["instructors"] as $key => $name) {
									echo $name;
									if (!$key == count($class["instructors"]) - 1) {
										echo ", ";
									}
								}
							} else {
								echo "&lt;Data not found&gt;";
							}
							?>
						</div>
					</div>
				</div>
				<div class="row">
					<div class="col-md-2">
						<div class="header">
							LOCATION(S)
						</div>
					</div>
					<div class="col-md-10">
						<div class="item header">
							<?php
							if (count($class["locations"]) != 0) {
								foreach ($class["locations"] as $key => $name) {
									echo $name;
									if (!$key == count($class["locations"]) - 1) {
										echo ", ";
									}
								}
							} else {
								echo "&lt;Data not found&gt;";
							}
							?>
						</div>
					</div>
				</div>
				<div class="row">
					<div class="col-md-2">
						<div class="header">
							READING(S)
						</div>
					</div>
					<div class="col-md-10">
						<div class="item header">
							<?php
							if (count($class["readings"]) != 0) {
								foreach ($class["readings"] as $key => $name) {
									echo $name;
									if (!$key == count($class["readings"]) - 1) {
										echo ", ";
									}
								}
							} else {
								echo "&lt;Data not found&gt;";
							}
							?>
						</div>
					</div>
				</div>
				<div class="row">
					<div class="col-md-1">
						<div class="header">
							TIME
						</div>
					</div>
					<div class="col-md-2">
						<div class="item header">
							<?php
							if ($class["travel"]) {
								echo "Travel";
							} else if ($class["type"] == "am") {
								echo "Morning";
							} else if ($class["type"] == "pm") {
								echo "Afternoon";
							} else if ($class["type"] == "full") {
								echo "Full Day";
							} else {
								echo "&lt;Data not found&gt;";
							}
							?>
						</div>
					</div>
					<div class="col-md-2">
						<div class="header">
							STUDENTS
						</div>
					</div>
					<div class="col-md-1">
						<div class="item header">
							<?php echo strtoupper($class["max"]); ?>
						</div>
					</div>
					<div class="col-md-1">
						<div class="header">
							COST
						</div>
					</div>
					<div class="col-md-3">
						<div class="item header">
							<?php
							if ($class["cost"] != "") {
								echo "$".$class["cost"];
							} else {
								echo "&lt;Data not found&gt;";
							}
							?>
						</div>
					</div>
				</div>
				<span class="header">
					DESCRIPTION
					<br>
				</span>
				<span style="font-size:9.0pt;font-family:Arial">
					<?php echo $class["description"]; ?>
				</span>
				<br>
				<br>
			</p>
			<?php
		}
		?>
	</div>
</body>
</html>