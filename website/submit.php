<?php
define("MINIMIZE", false);

//If we don't have any classes then we can't run!
if (!file_exists("data/classes.json")) {
	echo("Please generate your classes file!");
	exit;
}

//If we don't have a students file, then we should create one!
if (!file_exists("data/students.json")) {
	file_put_contents("data/students.json", "{}");
	chmod("data/students.json", 0777);
}

//# of choices, hardcoded because oh well
$choices = 8;

//List of intensives, nab this from ezekiel's weirdly laid out files
$list = array( "full" => array(""),	 "am" => array(""), "pm" => array("") );

$classes = json_decode(file_get_contents("data/classes.json"), true);

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
			$error = "Invalid full intensive #$i: $full";
			break;
		}
		if (!in_array($am, $list["am"])) {
			$error = "Invalid am intensive #$i: $am";
			break;
		}
		if (!in_array($pm, $list["pm"])) {
			$error = "Invalid pm intensive #$i: $pm";
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
		<?php
		$requestData = $_POST;

		$requestData["name"] = $requestData["fullname"];
		unset($requestData["fullname"]);
		
		$requestData["commonGround"] = $requestData["cg"];
		unset($requestData["cg"]);

		$requestData["hartfordTech"] = $requestData["hartfordtech"];
		unset($requestData["hartfordtech"]);

		$requestData["fordSayre"] = $requestData["fordsayre"];
		unset($requestData["fordsayre"]);
		
		unset($requestData["submitting"]);

		if ($requestData["fordSayre"] == "yes") {
			$requestData["fordSayre"] = true;
		} else {
			$requestData["fordSayre"] = false;
		}

		$requestData["choices"] = array();
		
		for ($i = 0; $i < 8; $i ++) {
			if ($requestData["full"][$i] != "") {
				$requestData["choicesx"][$i]["full"] = $requestData["full"][$i];
			}
			if ($requestData["am"][$i] != "") {
				$requestData["choices"][$i]["am"] = $requestData["am"][$i];
			}
			if ($requestData["pm"][$i] != "") {
				$requestData["choices"][$i]["pm"] = $requestData["pm"][$i];
			}
		}

		unset($requestData["full"]);
		unset($requestData["am"]);
		unset($requestData["pm"]);

		//Write it out
		$students = json_decode(file_get_contents("data/students.json"), true);
		array_push($students,$requestData);

		file_put_contents("data/students.json", json_encode($students));

		?>
		<pre><?php echo json_encode($requestData,JSON_PRETTY_PRINT); ?></pre>
		<a href="<?php echo($_SERVER["PHP_SELF"]);?>">Back</a>
		<?php
	}
} else {
	?>
	<html>
	<head>
		<link rel="stylesheet" href="css/font-awesome.min.css">
		<link rel="stylesheet" href="css/bootstrap.min.css">
		<link rel="stylesheet" href="css/custom.css">
		<script type="text/javascript" src="js/jquery.min.js"></script>
		<script type="text/javascript" src="js/bootstrap.min.js"></script>
		<script type="text/javascript">
			var choices = <?php echo $choices; ?>;
			function checkForm() {
				/*Check all inputs*/
				var response = {"fullname":false,"grade":true,"cg":false,"studentid":false,"fordsayre":true,"hartfordtech":true};
				for (var i = 0; i < choices; i ++) {
					/*You need to have either a full-day or both half-days*/
					if ($("#select-full-" + i).val() == "" && ($("#select-am-" + i).val() == "" || $("#select-pm-" + i).val() == "")) {
						response["fchoice"+i] = false;
					} else {
						response["choice"+i] = true;
					}
				}

				if ($("#fullname").val() != "") {
					response.fullname = true;
				}
				if ($("#grade").val() != "") {
					response.grade = true;
				}
				if ($("#cg").val() != "") {
					response.cg = true;
				}
				if ($("#studentid").val() != "") {
					response.studentid = true;
				}

				return response;
			}

			/*Spit out the intensive list*/
			var intensives = <?php echo(json_encode($list)); ?>;

			/*On ready, load up all the selector checkers*/
			$(document).ready(function() {
				/*Loop for each choice*/
				for (var i = 0; i < choices; i++) {
					/*Add to the list*/
					for (var intensive in intensives["full"]) {
						$("<option name=\"" + intensives["full"][intensive] + "\">" + intensives["full"][intensive] + "</option>").appendTo($("#select-full-" + i));
					}
					for (var intensive in intensives["am"]) {
						$("<option name=\"" + intensives["am"][intensive] + "\">" + intensives["am"][intensive] + "</option>").appendTo($("#select-am-" + i));
					}
					for (var intensive in intensives["pm"]) {
						$("<option name=\"" + intensives["pm"][intensive] + "\">" + intensives["pm"][intensive] + "</option>").appendTo($("#select-pm-" + i));
					}

					/*If you select full-day, you don't get to choose any half-days*/
					$("#select-full-" + i).change(function(event) {
						var num = $(this).attr("select-num");
						$("#select-am-" + num).val("");
						$("#select-pm-" + num).val("");
						checkForm();
					});
					/*If you select half-day, you don't get to choose a full-day*/
					$("#select-am-" + i).change(function(event) {
						var num = $(this).attr("select-num");
						$("#select-full-" + num).val("");
						checkForm();
					});
					$("#select-pm-" + i).change(function(event) {
						var num = $(this).attr("select-num");
						$("#select-full-" + num).val("");
						checkForm();
					});
				};

				$(".hartfordtech").change(function(event) {
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

				$("#form-tag").submit(function(){
					var response = checkForm();

					if (!response.fullname) {
						$("#fullname").parent().parent().addClass("has-error");
					} else {
						$("#fullname").parent().parent().removeClass("has-error");
					}
					if (!response.grade) {
						$("#grade").parent().parent().addClass("has-error");
					} else {
						$("#grade").parent().parent().removeClass("has-error");
					}
					if (!response.cg) {
						$("#cg").parent().parent().addClass("has-error");
					} else {
						$("#cg").parent().parent().removeClass("has-error");
					}
					if (!response.studentid) {
						$("#studentid").parent().parent().addClass("has-error");
					} else {
						$("#studentid").parent().parent().removeClass("has-error");
					}

					for (var i = 0; i < choices; i++) {
						if (!response["choice"+i]) {
							$("#choice"+i).addClass("has-error");
						} else {
							$("#choice"+i).removeClass("has-error");
						}
					};
					
					for (var i = 0; i < Object.keys(response).length; i++) {
						if (!response[Object.keys(response)[i]]) {
							return false;
						}
					};
				})
});
</script>
</head>
<body>
	<div class="container">
		<?php /*Super lazy redirection*/ ?>
		<form method="POST" id="form-tag">
			<div>
				<div class="row row-margin-top row-margin-bottom">
					<div class="col-md-2">
						<label class="control-label">Full Name:</label>
					</div>
					<div class="col-md-10"><input class="form-control" type="text" name="fullname" id="fullname" placeholder="John Doe"></div>
				</div>
				<div class="row row-margin-top row-margin-bottom">
					<div class="col-md-2">
						<label class="control-label">Grade:</label>
					</div>
					<div class="col-md-10">
						<select name="grade" id="grade" class="form-control">
							<option value="12" selected>12</option>
							<option value="11">11</option>
							<option value="10">10</option>
							<option value="9">9</option>
						</select>
					</div>
				</div>
				<div class="row row-margin-top row-margin-bottom">
					<div class="col-md-2">
						<label class="control-label">Common Ground #:</label>
					</div>
					<div class="col-md-10"><input class="form-control" type="text" name="cg" id="cg"></div>
				</div>
				<div class="row row-margin-top row-margin-bottom">
					<div class="col-md-2">
						<label class="control-label">Student ID #:</label>
					</div>
					<div class="col-md-10">
						<input class="form-control" type="text" name="studentid" id="studentid">
					</div>
				</div>
				<div class="row row-margin-top row-margin-bottom">
					<div class="col-md-2">
						<label class="control-label">Hartford Tech:</label>
					</div>
					<div class="col-md-10">
						<label class="control-label"><input type="radio" class="hartfordtech" name="hartfordtech" value="none" checked> None</label>
						<label class="control-label"><input type="radio" class="hartfordtech" name="hartfordtech" value="am"> Morning</label>
						<label class="control-label"><input type="radio" class="hartfordtech" name="hartfordtech" value="pm"> Afternoon</label>
					</div>
				</div>
				<div class="row row-margin-top row-margin-bottom">
					<div class="col-md-2">
						<label class="control-label">Ford Sayre:</label>
					</div>
					<div class="col-md-5">
						<label><input type="radio" class="fordsayre" name="fordsayre" value="no" checked> No</label>
						<label><input type="radio" class="fordsayre" name="fordsayre" value="yes"> Yes</label>
					</div>
				</div>
			</div>
			<div>
				<?php
				/*Spit out eight choice selectors*/
				for ($i = 0; $i < $choices; $i ++) {
					?>
					<div id="choice<?php echo $i; ?>" class="row row-margin-top row-margin-bottom">
						<div class="col-md-2"><label class="control-label">Choice <?php echo($i + 1);?>:</label></div>
						<div class="col-md-4"><select class="form-control" id="select-full-<?php echo($i);?>" select-num="<?php echo($i);?>" name="full[<?php echo($i);?>]"></select></div>
						<div class="col-md-3"><select class="form-control" id="select-am-<?php echo($i);?>" select-num="<?php echo($i);?>" name="am[<?php echo($i);?>]"></select></div>
						<div class="col-md-3"><select class="form-control" id="select-pm-<?php echo($i);?>" select-num="<?php echo($i);?>" name="pm[<?php echo($i);?>]"></select></div>
					</div>
					<?php
				}
				?>
			</div>
			<div class="row row-margin-top row-margin-bottom">
				<div class="col-md-2 col-md-offset-5">
					<input class="btn btn-block btn-defualt" type="submit" value="Submit" id="form-submit">
				</div>
			</div>
			<input type="hidden" name="submitting" value="true">
		</form>
	</div>
</body>
</html>
<?php
}
$output = ob_get_clean();
if (MINIMIZE) {
	//Do magic with $output
	$lines = explode("\n", $output);
	foreach ($lines as $line) {
		//Strip stuff from the beginning of the line
		$lines[array_search($line, $lines)] = trim($line);
	}
	echo(implode("\n", $lines));
} else {
	echo($output);
}
?>
