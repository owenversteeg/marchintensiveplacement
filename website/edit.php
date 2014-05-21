<?php
if (!file_exists('data/classes.json') || !file_exists('data/students.json') || !file_exists('data/studentsNotPlaced.json')) {
	echo "Please generate your data files";
	exit;
}
?>
include 'header.php';
	<script>
		function sendNetworkRequest(operation,user,cl,obj) {
			$.ajax({
				type: "POST",
				url: "editAction.php",
				data: { "operation": operation, "user": user, "class": cl }
			})
			.done(function( msg ) {
				if (msg == "TRUE" && operation == "remove") {
					obj.parent().parent().slideUp();
				} else if (msg == "TRUE" && operation == "add") {
					obj.parent().parent().before('<div style="display:none;" class="row"><div class="col-md-6">'+user+'</div><div class="col-md-6"><span class="studentremovebutton glyphicon glyphicon-remove" netuser="'+user+'" netclass="'+cl+'"></span></div></div>');
					obj.parent().parent().prev().slideDown();
					$('#addUser'+obj.attr('netclass')).val('');
				} else {
					alert(msg);
				}
			});
		}
		function addUser(user,cl) {
			sendNetworkRequest('add',$('#').val(),cl);
		}
		$(document).ready(function(){
			$(document).on('click','.studentremovebutton',function(){
				if ($(this).attr('netuser') != undefined && $(this).attr('netclass') != undefined) {
					sendNetworkRequest('remove',$(this).attr('netuser'),$(this).attr('netclass'),$(this));
				} else {
					return false;
				}
			});
			$(document).on('click','.addstudentbutton',function(){
				if ($(this).attr('netclass') != undefined && $('#addUser'+$(this).attr('netclass')).val() != "") {
					sendNetworkRequest('add',$('#addUser'+$(this).attr('netclass')).val(),$(this).attr('netclass'),$(this));
				} else {
					return false;
				}
			});
			$('.addUserForm').submit(function(event){
				$('#'+$(this).attr('netid')).click();
				event.preventDefault();
			});
		});
	</script>
</head>
<body>
	<div id="container" class="container">
		<div class="row row-margin-top row-margin-bottom">
			<div class="col-md-1">
				<a href="index.php" class="btn btn-info btn-block">Home</a>
			</div>
		</div>
		<?php
		$classes = json_decode(file_get_contents('data/classes.json'),true);
		$students = json_decode(file_get_contents('data/students.json'),true);

		foreach ($classes as $className => $class) {
			?>
			<div class="row well row-margin-top row-margin-bottom">
				<div class="col-md-6">
					<div class="row">
						<div class="col-md-12">
							<?php echo '<h4>'.$class['displayname'].'</h4>'; ?>
						</div>
					</div>
					<div class="row row-margin-top">
						<div class="col-md-12">
							<pre> <?php echo json_encode($class,JSON_PRETTY_PRINT); ?></pre>
						</div>
					</div>
				</div>
				<div class="col-md-6">
					<?php
					foreach ($class['enrolled'] as $key => $student) {
						?>
						<div class="row">
							<div class="col-md-6">
								<?php echo $student; ?>
							</div>
							<div class="col-md-6">
								<span class="studentremovebutton glyphicon glyphicon-remove" netuser="<?php echo $student; ?>" netclass="<?php echo $className; ?>"></span>
							</div>
						</div>
						<?php
					}
					?>
					<div class="row">
						<div class="col-md-6">
							<form class="addUserForm" netid="addUserButton<?php echo $className; ?>">
								<input id="addUser<?php echo $className; ?>" class="addUserField" type="text" name="user" placeholder="Click to add a user...">
							</form>
						</div>
						<div class="col-md-6">
							<span id="addUserButton<?php echo $className; ?>" class="addstudentbutton glyphicon glyphicon-plus" netclass="<?php echo $className; ?>"></span>
						</div>
					</div>
				</div>
			</div>
			<?php
		}
		?>
	</div>
</body>
</html>
