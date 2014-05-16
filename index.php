<?php

//# of choices, hardcoded because oh well
$choices = 8;

//List of intensives, nab this from ezekiel's weirdly laid out files
$list = array(
				"full" => array(""),	
				"am" => array(""),
				"pm" => array("")
			);

$classes = json_decode(file_get_contents("resources/classes.json"), true);

foreach ($classes as $name => $className) {
	$type = strtolower($className["type"]);
	array_push($list[$type], $name);
}

sort($list["full"]);
sort($list["am"]);
sort($list["pm"]);

if (array_key_exists("submitting", $_POST)) {
	//Check their input
	$error = false;

	for ($i = 0; $i < $choices; $i ++) {
		$full = $_POST["full"][$i];
		$am = $_POST["am"][$i];
		$pm = $_POST["pm"][$i];

		//Make sure they're correct
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

		//Make sure they selected something
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
		//No error, continue
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
	//Rest of the page
?>
<?php /* JQuery */ ?>
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
<script type="text/javascript">
<?php /* On ready, load up all the selector checkers */ ?>
$(document).ready(function() {
<?php /* Loop for each choice */ ?>
	for (var i = 0; i < <?php echo($choices);?>; i ++) {
<?php /* If you select full-day, you don't get to choose any half-days */ ?>
		$("#select-full-" + i).change(function(event) {
			var num = $(this).attr("select-num");
			$("#select-am-" + num).val("");
			$("#select-pm-" + num).val("");
			updateSubmit();
		});
<?php /* If you select half-day, you don't get to choose a full-day */ ?>
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

<?php /* Make sure they've filled all their choices */ ?>
	updateSubmit();
});

function updateSubmit() {
<?php /* Check all inputs */ ?>
	var good = true;
	for (var i = 0; i < <?php echo($choices);?>; i ++) {
<?php /* You need to have either a full-day or both half-days */ ?>
		if ($("#select-full-" + i).val() == "" &&
			($("#select-am-" + i).val() == "" ||
			 $("#select-pm-" + i).val() == "")) {
			good = false;
			break;
		}
	}

<?php /* Update the button */ ?>
	if (good)
		$("#form-submit").attr("disabled", null);
	else
		$("#form-submit").attr("disabled", "disabled");
}

</script>
<div>
<?php /* Super lazy redirection */ ?>
<form action="<?php echo($_SERVER["PHP_SELF"]); ?>" method="POST">
<div>
First Name: <input type="text" name="firstname" placeholder="John"><br>
Last Name:  <input type="text" name="lastname"  placeholder="Doe"><br>
Grade:
<select name="grade">
	<option value="12" selected>12</option>
	<option value="11">11</option>
	<option value="10">10</option>
	<option value="9">9</option>
</select><br>
Common Ground #: <input type="text" name="cg"><br>
Student ID #: <input type="text" name="studentid"><br>
Are you... (Select all that apply):<br>
<input type="checkbox" id="hartford" name="hartford"><label for="hartford">A Hartford Tech Student</label><br>
<input type="checkbox" id="fordsayre" name="fordsayre"><label for="fordsayre">A Ford Sayre Student</label>
</div>
<div>
<?php
//Spit out eight choice selectors
for ($i = 0; $i < $choices; $i ++) {
/*
 <select id="select-full-0" select-num="0" name="full0">
	<option name="" selected>
	...
 </select>
 <select id="select-am-0" select-num="0" name="am0">
	<option name="" selected>
	...
 </select>
 <select id="select-pm-0" select-num="0" name="pm0">
	<option name="" selected>
	...
 </select>
 */
?>
<div>
Choice <?php echo($i + 1);?>:
	<select id="select-full-<?php echo($i);?>" select-num="<?php echo($i);?>" name="full[<?php echo($i);?>]">
<?php
	foreach ($list["full"] as $intensive) {
?>
	<option name="<?php echo($intensive); ?>"><?php echo($intensive); ?></option>
<?php
	}
?>
	</select>
	<select id="select-am-<?php echo($i);?>" select-num="<?php echo($i);?>" name="am[<?php echo($i);?>]">
<?php
	foreach ($list["am"] as $intensive) {
?>
	<option name="<?php echo($intensive); ?>"><?php echo($intensive); ?></option>
<?php
	}
?>
	</select>
	<select id="select-pm-<?php echo($i);?>" select-num="<?php echo($i);?>" name="pm[<?php echo($i);?>]">
<?php
	foreach ($list["pm"] as $intensive) {
?>
	<option name="<?php echo($intensive); ?>"><?php echo($intensive); ?></option>
<?php
	}
?>
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
<?php
}
?>