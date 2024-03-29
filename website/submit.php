<?php
ini_set("zlib.output_compression", "On");
ini_set("zlib.output_compression", 4096);

define("MINIMIZE", false);

//If we don't have any classes then we can't run!
if (!file_exists("data/classes.json")) {
	echo("Please generate your classes file!");
	exit;
}

//Start output capture
ob_start();

//# of choices, hardcoded because oh well
$choices = 8;

//List of intensives, nab this from ezekiel's weirdly laid out files
$list = array( "full" => array(array("name" => "", "displayname" => "")),	 "am" => array(array("name" => "", "displayname" => "")), "pm" => array(array("name" => "", "displayname" => "")) );

$classes = json_decode(file_get_contents("data/classes.json"), true);

foreach ($classes as $name => $className) {
	$type = strtolower($className["type"]);
	array_push($list[$type], array("name" => $name, "displayname" => $className["displayname"]));
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

		$foundFull = false;
		foreach ($list["full"] as $key => $value) {
			if ($full == $list["full"][$key]["name"]) {
				$foundFull = true;
				break;
			}
		}
		if (!$foundFull) {
			$error = "Invalid full intensive #$i: $full";
			break;
		}
		$foundAm = false;
		foreach ($list["am"] as $key => $value) {
			if ($am == $list["am"][$key]["name"]) {
				$foundAm = true;
				break;
			}
		}
		if (!$foundAm) {
			$error = "Invalid am intensive #$i: $am";
			break;
		}
		$foundPm = false;
		foreach ($list["pm"] as $key => $value) {
			if ($pm == $list["pm"][$key]["name"]) {
				$foundPm = true;
				break;
			}
		}
		if (!$foundPm) {
			$error = "Invalid pm intensive #$i: $full";
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
		$requestData["commonGround"] = $requestData["cg"];
		$requestData["hartfordTech"] = $requestData["hartfordtech"];
		$requestData["fordSayre"] = $requestData["fordsayre"];
		unset($requestData["submitting"], $requestData["fullname"], $requestData["fordsayre"], $requestData["hartfordtech"], $requestData["cg"]);

		if ($requestData["fordSayre"] == "yes") {
			$requestData["fordSayre"] = true;
		} else {
			$requestData["fordSayre"] = false;
		}

		$requestData["choices"] = array();

		for ($i = 0; $i < 8; $i ++) {
			if ($requestData["full"][$i] != "") {
				$requestData["choices"][$i]["full"] = $requestData["full"][$i];
			}
			if ($requestData["am"][$i] != "") {
				$requestData["choices"][$i]["am"] = $requestData["am"][$i];
			}
			if ($requestData["pm"][$i] != "") {
				$requestData["choices"][$i]["pm"] = $requestData["pm"][$i];
			}
		}

		unset($requestData["full"], $requestData["am"], $requestData["pm"]);

		//Write it to the database
		require("mysql-config.php");

		$query = $db->prepare("INSERT INTO `choices` SET `studentid` = :id, `choices` = :choices");
		$query->bindValue(":id", $requestData["studentid"]);
		$query->bindValue(":choices", json_encode($requestData));
		$query->execute();

		?>
		<pre><?php echo json_encode($requestData,JSON_PRETTY_PRINT); ?></pre>
		<a href="<?php echo($_SERVER["PHP_SELF"]);?>">Back</a>
		<?php
	}
} else {
	include 'header.php';
	?>
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

				var thingsToCheck = ['fullname', 'grade', 'cg', 'studentid'];

				for (var i=0; i<thingsToCheck.length; i++) {
					if ($('#'+thingsToCheck[i]).val()) {
						response[thingsToCheck[i]] = true;
					}
				}

				var choices = {"full":[],"am":[],"pm":[]};
				for (var i=0; i<Object.keys(choices).length; i++) {
					$('.select-'+Object.keys(choices)[i]).each(function(){
						choices[Object.keys(choices)[i]].push($(this).val());
					});
				}
				for (var i = 0; i < choices.full.length; i++) {
					if (choices.full.indexOf(choices.full[i]) != i) {
						if ($('#select-full-'+i).val() != '') {
							alert('You may only request a class once');
						}
						$('#select-full-'+i).val('');
					}
				}
				return response;
			}

			/*Spit out the intensive list*/
			var intensives = <?php echo(json_encode($list)); ?>;

			function updateLists() {
				/*Find selected intensives*/
				var selected = [];
				for (var i = 0; i < choices; i ++) {
					var full = $("#select-full-" + i).val();
					if (full != "") selected.push(full);
				}

				for (var i = 0; i < choices; i++) {
					var full = $("#select-full-" + i).val();
					var am = $("#select-am-" + i).val();
					var pm = $("#select-pm-" + i).val();

					$("#select-full-" + i).empty();
					$("#select-am-" + i).empty();
					$("#select-pm-" + i).empty();

					/*Add to the list*/
					for (var intensive in intensives["full"]) {
						/*Make sure it's not selected yet*/
						if (selected.indexOf(intensives["full"][intensive].name) != -1 && full != intensives["full"][intensive].name)
							continue;
						$("<option value=\""+ intensives["full"][intensive].name +"\" name=\"" + intensives["full"][intensive]["name"] + "\">" + intensives["full"][intensive].displayname + "</option>").appendTo($("#select-full-" + i));
					}
					/*Half-days can have any intensive*/
					for (var intensive in intensives["am"]) {
						$("<option value=\""+ intensives["am"][intensive].name +"\" name=\"" + intensives["am"][intensive]["name"] + "\">" + intensives["am"][intensive].displayname + "</option>").appendTo($("#select-am-" + i));
					}
					for (var intensive in intensives["pm"]) {
						$("<option value=\""+ intensives["pm"][intensive].name +"\" name=\"" + intensives["pm"][intensive]["name"] + "\">" + intensives["pm"][intensive].displayname + "</option>").appendTo($("#select-pm-" + i));
					}

					if (full != "") $("#select-full-" + i).val(full);
					if (am != "") $("#select-am-" + i).val(am);
					if (pm != "") $("#select-pm-" + i).val(pm);
				}
			}

			/*On ready, load up all the selector checkers*/
			$(document).ready(function() {
				updateLists();

				/*Loop for each choice*/
				for (var i = 0; i < choices; i++) {
					/*If you select full-day, you don't get to choose any half-days*/
					$("#select-full-" + i).change(function(event) {
						var num = $(this).attr("select-num");
						$("#select-am-" + num).val("");
						$("#select-pm-" + num).val("");
						checkForm();
						updateLists();
					});
					/*If you select half-day, you don't get to choose a full-day*/
					function selectAMOrPMOnchange (event) {
						var num = $(this).attr("select-num");
						$("#select-full-" + num).val("");
						checkForm();
						updateLists();
					}
					$("#select-am-" + i).change(selectAMOrPMOnchange);
					$('#select-pm-' + i).change(selectAMOrPMOnchange)
				}

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
				})

				$("#form-tag").submit(function(){
					var response = checkForm();
					var responseThings = ['fullname', 'grade', 'cg', 'studentid'];

					for (var i=0; i<responseThings.length; i++) {
						if (response[responseThings[i]]) {
							$("#"+responseThings[i]).parent().removeClass("has-error");
							$($("#"+responseThings[i]).parent().parent().children()[$("#"+responseThings[i]).parent().parent().children().index($("#"+responseThings[i]).parent()) - 1]).removeClass("has-error");
						} else {
							$("#"+responseThings[i]).parent().addClass("has-error");
							$($("#"+responseThings[i]).parent().parent().children()[$("#"+responseThings[i]).parent().parent().children().index($("#"+responseThings[i]).parent()) - 1]).addClass("has-error");
						}
					}

					for (var i = 0; i < choices; i++) {
						if (!response["choice"+i]) {
							$("#choice"+i).addClass("has-error");
						} else {
							$("#choice"+i).removeClass("has-error");
						}
					}

					for (var i = 0; i < Object.keys(response).length; i++) {
						if (!response[Object.keys(response)[i]]) {
							return false;
						}
					}
				})
});
</script>
</head>
<body>
	<div class="container">
		<div class="row row-margin-top">
			<div class="col-md-1">
				<a href="index.php" class="btn btn-info btn-block">Home</a>
			</div>
		</div>
		<?php /*Super lazy redirection*/ ?>
		<form method="POST" id="form-tag">
			<div>
				<div class="row row-margin-top row-margin-bottom">
					<div class="col-md-2">
						<label class="control-label">Full Name:</label>
					</div>
					<div class="col-md-4"><input class="form-control" type="text" name="fullname" id="fullname" placeholder="John Doe"></div>
					<div class="col-md-2">
						<label class="control-label">Grade:</label>
					</div>
					<div class="col-md-4">
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
					<div class="col-md-4"><input class="form-control" type="text" name="cg" id="cg"></div>
					<div class="col-md-2">
						<label class="control-label">Student ID #:</label>
					</div>
					<div class="col-md-4">
						<input class="form-control" type="text" name="studentid" id="studentid">
					</div>
				</div>
				<div class="row row-margin-top row-margin-bottom">
					<div class="col-md-2">
						<label class="control-label">Hartford Tech:</label>
					</div>
					<div class="col-md-4">
						<label class="control-label"><input type="radio" class="hartfordtech" name="hartfordtech" value="none" checked> None&nbsp;</label>
						<label class="control-label"><input type="radio" class="hartfordtech" name="hartfordtech" value="am"> Morning&nbsp;</label>
						<label class="control-label"><input type="radio" class="hartfordtech" name="hartfordtech" value="pm"> Afternoon</label>
					</div>
					<div class="col-md-2">
						<label class="control-label">Ford Sayre:</label>
					</div>
					<div class="col-md-4">
						<label><input type="radio" class="fordsayre" name="fordsayre" value="no" checked> No&nbsp;</label>
						<label><input type="radio" class="fordsayre" name="fordsayre" value="yes"> Yes</label>
					</div>
				</div>
			</div>
			<hr>
			<div>
				<div id="headers" class="row row-margin-top row-margin-bottom visible-md visible-lg">
					<div class="col-md-2"></div>
					<div class="col-md-4">Full-Day</div>
					<div class="col-md-3">AM Only</div>
					<div class="col-md-3">PM Only</div>
				</div>
				<?php
				/*Spit out eight choice selectors*/
				for ($i = 0; $i < $choices; $i ++) {
					?>
					<div id="choice<?php echo $i; ?>" class="row row-margin-top row-margin-bottom">
						<div class="col-md-2">
							<label class="control-label">
							Choice <?php echo($i + 1);?>:
							</label>
						</div>
						<div class="col-xs-4 col-sm-2 hidden-md hidden-lg">
							Full-Day
						</div>
						<div class="col-md-4 col-sm-10 col-xs-8">
							<select class="form-control select-full" id="select-full-<?php echo($i);?>" select-num="<?php echo($i);?>" name="full[<?php echo($i);?>]">
							</select>
						</div>
						<div class="col-xs-4 col-sm-2 hidden-md hidden-lg">
							AM Only
						</div>
						<div class="col-md-3 col-sm-10 col-xs-8">
							<select class="form-control select-am" id="select-am-<?php echo($i);?>" select-num="<?php echo($i);?>" name="am[<?php echo($i);?>]">
							</select>
						</div>
						<div class="col-xs-4 col-sm-2 hidden-md hidden-lg">
							PM Only
						</div>
						<div class="col-md-3 col-sm-10 col-xs-8">
							<select class="form-control select-pm" id="select-pm-<?php echo($i);?>" select-num="<?php echo($i);?>" name="pm[<?php echo($i);?>]">
							</select>
						</div>
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
//Finish output capture
$output = ob_get_clean();

if (MINIMIZE) {
	//Do magic with $output
	$lines = explode("\n", $output);
	foreach ($lines as $line) {
		//So we can insert it later
		$linepos = array_search($line, $lines);

		//Strip stuff from the beginning of the line
		$line = trim($line);

		//Strip out comments
		if (strpos($line, "/*") !== FALSE && strpos($line, "*/") !== FALSE) {
			$line = substr($line, 0, strpos($line, "/*")) . substr($line, strpos($line, "*/") + 2);
		}

		if (strlen($line))
			$lines[$linepos] = $line;
	}
	echo(implode("", $lines));
} else {
	echo($output);
}
?>
