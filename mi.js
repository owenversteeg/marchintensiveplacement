var fs = require('fs');

var classes = readFileSync('classes.json');
var students = readFileSync('students.json');

var studentIndex = []; /*Used to randomly order students*/
var studentUnplaceableIndex = []; /*Used to track students that were not assigned to a class*/

var doNotAssignClassesWhenNoneAreRequested = true; /*If a user doesn't request any classes, they will not be given one and no error will be output*/
var verbose = false; /*Output operations, triggerable with --verbose as well*/

if (process.argv.indexOf('--verbose') !== -1) {
	verbose = true;
}

function readFileSync(file) {
	return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function writeFileSync(file, obj, options) {
	var str = JSON.stringify(obj, null, module.exports.spaces);
	return fs.writeFileSync(file, str, options); //not sure if fs.writeFileSync returns anything, but just in case
}

function shuffle(array) {
	/*shuffles an array*/
	var currentIndex = array.length
	, temporaryValue
	, randomIndex
	;

	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}

function randomIntFromInterval(min,max) {
	/*Generates a random number from min to max, including*/
	return Math.floor(Math.random()*(max-min+1)+min);
}

function placeStudent(s,c) {
	/*places student s in class c, where possible. c is an object, with keys FULL, AM, and PM, s is a string*/
	
	/*find the student's index in students[]*/
	var si;
	for (var i = 0; i < students.length; i++) {
		if (students[i].name = s) {
			si = i;
			break;
		}
	};
	/*terminate if student doesn't exist, throw error if verbose=true*/
	if (si == undefined) {
		if (verbose) {
			console.log('Index for '+s+' could not be found!');
		}
		return false;
	}
	/*terminate if class doesn't exist, throw error if verbose=true*/
	if (c == undefined) {
		if (verbose) {
			console.log('Class for '+s+' could not be found!');
		}
		return false;
	}
	/*if FULLDAY and not AM/PM, assign FULLDAY class if not full etc.*/
	if (c.FULL !== null && c.AM === null && c.PM === null) {
		var cF = c.FULL;
		try {
			if (classes[cF].enrolled.length < classes[cF].max) {
				classes[cF].enrolled.push(s);
				students[index].hasClass = true;
				if (verbose) {
					console.log(s+' has been placed in '+cF);
				}
			} else {
				if (verbose) {
					console.log('Class '+cF+' is full! ('+s+')');
				}
				return false;
			}
		} catch (err) {
			console.log('----');
			console.log('ERROR:'+err.message);
			console.log(cAM+', '+cPM);
			console.log(cF);
			console.log(s);
		}
		/*IF AM/PM and not FULLDAY assign AM/PM if both are not full*/
	} else if (c.FULL === null && c.AM !== null && c.PM !== null) {
		var cAM = c.AM;
		var cPM = c.PM;
		try {
			if ((classes[cAM].enrolled.length < classes[cAM].max) && (classes[cPM].enrolled.length < classes[cPM].max)) {
				classes[cAM].enrolled.push(s)
				classes[cPM].enrolled.push(s)
				students[index].hasClass = true;
				if (verbose) {
					console.log(s+' has been placed in '+cAM+' & '+cPM);
				}
			} else {
				if (verbose) {
					console.log('Class '+cPM+' or '+cAM+' is full! ('+s+')');
				}
				return false;
			}
		} catch (err) {
			console.log('----');
			console.log('ERROR:'+err.message);
			console.log(cAM+', '+cPM);
			console.log(cF);
			console.log(s);
		}
		/*terminate, throw error if verbose=true, also used to mark a user as having a class based on settings*/
	} else {
		if (verbose) {
			console.log('The class data for '+s+' is not valid.');
		}
		if (doNotAssignClassesWhenNoneAreRequested) { /*If a user doesn't request any classes, they will not be given one and no error will be output*/
			students[index].hasClass = true;
	}
}
return true;
}

/*prepares data, hasClass, shouldn't be passed, will be overritten*/
for (var i = 0; i < students.length; i++) {
	students[i].hasClass = false;
};
/*randomize student indexes*/
while (studentIndex.length < students.length) {
	var rand = randomIntFromInterval(0,students.length - 1);
	if (studentIndex.indexOf(rand) === -1) {
		studentIndex.push(rand);
	}
}
/*two loops, first time won't assign classes not requests*/
for (var y = 0; y < 2; y++) {
	/*go through random student array*/
	for (var i = 0; i < studentIndex.length; i++) {
		var index = studentIndex[i];
		var placed = false;
		/*if the student has no class, try to assing their requests*/
		if (students[index].hasClass !== true) {
			/*going from request 1, to last request*/
			for (var n = 0; n < students[index].choices.length; n++) {
				if (placeStudent(students[index].name,students[index].choices[n],index)) {
					placed = true;
					break;
				}
			}
		}
		/*if the student has no class, and not the first loop, assign to random class*/
		if (!placed && y !== 0) {
			/*loop classes*/
			for (var n = 0; n < Object.keys(classes).length; n++) {
				var key = Object.keys(classes)[n];
				/*find first FULLDAY type class that isn't empty. This will change in the future*/
				if (classes[key].type == 'FULL') {
					if (placeStudent(students[index].name,{"FULL":key,"AM":null,"PM":null},index)) {
						placed = true;
						break;
					}
				}
			};
		}
		/*If unable to place the student, put them on the unplaceable list*/
		if (!placed && y !== 0) {
			studentUnplaceableIndex.push(index);
		}
	};
};
/*look through the student unplaceable index, and replace it with names so that it can be read easier*/
for (var i = 0; i < studentUnplaceableIndex.length; i++) {
	studentUnplaceableIndex[i] = students[studentUnplaceableIndex[i]].name;
};
/*print the success percentage*/
var percentage = (studentIndex.length-studentUnplaceableIndex.length)/studentIndex.length*100;
console.log(Math.round(percentage)+'% placement, where '+(studentIndex.length - studentUnplaceableIndex.length)+' student(s) of '+studentIndex.length+' were placed');
/*write files*/
writeFileSync('classes-output.json', classes);
writeFileSync('students-output.json', studentUnplaceableIndex);
