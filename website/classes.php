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
			<div class="row row-margin-top row-margin-bottom">
				<div class="col-md-3">
					<h4><?php echo $class["displayname"]; ?></h4>
				</div>
				<div class="col-md-9">
					<?php echo $class["description"]; ?>
				</div>
			</div>
			<?php
		}
		?>
	</div>
</body>
</html>