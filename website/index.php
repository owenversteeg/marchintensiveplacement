<?php

//# of choices, hardcoded because oh well
$choices = 8;

//List of intensives, nab this from ezekiel's weirdly laid out files
$list = array(
				"full" => array(""),	
				"am" => array(""),
				"pm" => array("")
			);

$classes = json_decode(file_get_contents("../input/classes.json"), true);

foreach ($classes as $name => $className) {
	$type = strtolower($className["type"]);
	array_push($list[$type], $name);
}

sort($list["full"]);
sort($list["am"]);
sort($list["pm"]);

if (array_key_exists("submitting", $_POST)) {
	/*Check their input*/
	$error = false;

	for ($i = 0; $i < $choices; $i ++) {
		$full = $_POST["full"][$i];
		$am = $_POST["am"][$i];
		$pm = $_POST["pm"][$i];

		/*Make sure they're correct*/
		if (!in_array($full, $list["full"])) {
			$error = "Invalid full intensive #$i";
			break;
		}
		if (!in_array($am, $list["am"])) {
			$error = "Invalid am intensive #$i";
			break;
		}
		if (!in_array($pm, $list["pm"])) {
			$error = "Invalid pm intensive #$i";
			break;
		}

		/*Make sure they selected something*/
		if ($full == "" && ($am == "" || $pm == "")) {
			$error = "Invalid intensive #$i, not enough choices";
			break;
		}
	}

	if ($error !== false) {
		//Error, tell them
		?>
		<h1>Error</h1>
		<?php echo($error); ?>
		<a href="<?php echo($_SERVER["PHP_SELF"]);?>">Back</a>
		<?php
	} else {
		/*No error, continue*/
		?>
		<h1>Success</h1>
		Your results have been "recorded."<br>
		<br>
		Because I'm too lazy to do it now, here's a postdump:
		<pre><?php
			print_r($_POST);
			?></pre>
			<a href="<?php echo($_SERVER["PHP_SELF"]);?>">Back</a>
			<?php
		}
	} else {
		/*Rest of the page*/

		ob_start();

		?>
		<html>
		<head>
			<?php /* JQuery */ ?>
			<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
			<script type="text/javascript">
				
				/*Spit out the intensive list*/
				var intensives = <?php echo(json_encode($list)); ?>;

				/* On ready, load up all the selector checkers */
				$(document).ready(function() {
					/* Loop for each choice */
					for (var i = 0; i < <?php echo($choices);?>; i ++) {
						/* Add to the list */
						for (var intensive in intensives["full"]) {
							$("<option name=\"" + intensives["full"][intensive] + "\">" + intensives["full"][intensive] + "</option>").appendTo($("#select-full-" + i));
						}
						for (var intensive in intensives["am"]) {
							$("<option name=\"" + intensives["am"][intensive] + "\">" + intensives["am"][intensive] + "</option>").appendTo($("#select-am-" + i));
						}
						for (var intensive in intensives["pm"]) {
							$("<option name=\"" + intensives["pm"][intensive] + "\">" + intensives["pm"][intensive] + "</option>").appendTo($("#select-pm-" + i));
						}

						/* If you select full-day, you don't get to choose any half-days */
						$("#select-full-" + i).change(function(event) {
							var num = $(this).attr("select-num");
							$("#select-am-" + num).val("");
							$("#select-pm-" + num).val("");
							updateSubmit();
						});
						/* If you select half-day, you don't get to choose a full-day */
						$("#select-am-" + i).change(function(event) {
							var num = $(this).attr("select-num");
							$("#select-full-" + num).val("");
							updateSubmit();
						});
						$("#select-pm-" + i).change(function(event) {
							var num = $(this).attr("select-num");
							$("#select-full-" + num).val("");
							updateSubmit();
						});
					}

					$("#hartford").change(function(event) {
						alert("TODO: This button (ask the MI people)");
						return;
						var selected = $(this).is(":checked");
						for (var i = 0; i < <?php echo($choices);?>; i ++) {
							if (selected) {
								$("#select-am-" + i).attr("disabled", "disabled");
								$("#select-pm-" + i).attr("disabled", "disabled");
								$("#select-am-" + i).val("");
								$("#select-pm-" + i).val("");
							} else {
								$("#select-am-" + i).attr("disabled", null);
								$("#select-pm-" + i).attr("disabled", null);
							}
						}
					});

					$("#firstname").keydown(function(event) {
						updateSubmit();
					});
					$("#lastname").keydown(function(event) {
						updateSubmit();
					});
					$("#cg").keydown(function(event) {
						updateSubmit();
					});
					$("#studentid").keydown(function(event) {
						updateSubmit();
					});

					/* Make sure they've filled all their choices */
					updateSubmit();
				});
function updateSubmit() {
	/* Check all inputs */
	var good = true;
	for (var i = 0; i < <?php echo($choices);?>; i ++) {
		/* You need to have either a full-day or both half-days */
		if ($("#select-full-" + i).val() == "" &&
			($("#select-am-" + i).val() == "" ||
				$("#select-pm-" + i).val() == "")) {
			good = false;
		break;
	}
}

if ($("#firstname").val() == "" || $("#lastname").val() == "" || $("#id").val() == "" || $("#studentid").val() == "") {
	good = false;
}

/* Update the button */
if (good)
	$("#form-submit").attr("disabled", null);
else
	$("#form-submit").attr("disabled", "disabled");
}
</script>
</head>
<body>
	<div>
		<?php /* Super lazy redirection */ ?>
		<form method="POST">
			<div>
				First Name: <input type="text" name="firstname" id="firstname" placeholder="John"><br>
				Last Name:  <input type="text" name="lastname"  id="lastname"  placeholder="Doe"><br>
				Grade:
				<select name="grade">
					<option value="12" selected>12</option>
					<option value="11">11</option>
					<option value="10">10</option>
					<option value="9">9</option>
				</select><br>
				Common Ground #: <input type="text" name="cg" id="cg"><br>
				Student ID #: <input type="text" name="studentid" id="studentid"><br>
				Are you... (Select all that apply):<br>
				<input type="checkbox" id="hartford" name="hartford"><label for="hartford">A Hartford Tech Student</label><br>
				<input type="checkbox" id="fordsayre" name="fordsayre"><label for="fordsayre">A Ford Sayre Student</label>
			</div>
			<div>
				<?php
				/*Spit out eight choice selectors*/
				for ($i = 0; $i < $choices; $i ++) {
					?>
					<div>
						Choice <?php echo($i + 1);?>:
						<select id="select-full-<?php echo($i);?>" select-num="<?php echo($i);?>" name="full[<?php echo($i);?>]">
						</select>
						<select id="select-am-<?php echo($i);?>" select-num="<?php echo($i);?>" name="am[<?php echo($i);?>]">
						</select>
						<select id="select-pm-<?php echo($i);?>" select-num="<?php echo($i);?>" name="pm[<?php echo($i);?>]">
						</select>
					</div>
					<?php
				}
				?>
			</div>
			<input type="submit" value="Submit" id="form-submit">
			<input type="hidden" name="submitting" value="true">
		</form>
	</div>
</body>
</html>
<?php
$output = ob_get_clean();
echo($output);
	//TODO: This section
	// //Do magic with $output
	// $lines = explode("\n", $output);
	// foreach ($lines as $line) {
	// 	//Strip stuff from the beginning of the line
	// 	$lines[array_search($line, $lines)] = trim($line);
	// }
	// echo(implode("", $lines));
}
?>