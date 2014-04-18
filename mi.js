var fs = require('fs');

var studentIndex = []; /*Used to randomly order students*/
var studentUnplaceableIndex = []; /*Used to track students that were not assigned to a class*/
var happyness = []; /*Used to track how happy students are with their seleciton*/
var grades = [ 12, 11, 10, 9 ];
var doNotAssignClassesWhenNoneAreRequested = true; /*If a user doesn't request any classes, they will not be given one and no error will be output*/
var verbose = false; /*Output operations, triggerable with --verbose as well*/
var classFile = 'classes.json';
var studentsFile = 'students.json';
var outputClassesFile = 'classes-output.json';
var outputStudentsNotPlaced = 'students-output.json';
var useGrades = true;
var studentRandomData = {};
var studentClassData = {};

function setStudentHasClass(i,s) {
	studentClassData[i] = s;
}

function getStudentHasClass(i) {
	return studentClassData[i];
}

function readFileSync(file) {
	return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function writeFileSync(file, obj, options) {
	var str = JSON.stringify(obj, null, module.exports.spaces);
	return fs.writeFileSync(file, str, options); //not sure if fs.writeFileSync returns anything, but just in case
}

function getIndexOfStudentName(name) {
	for (var i = 0; i < students.length; i++) {
		if (students[i].name == name) {
			return i;
		}
	};
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
	/*terminate if student doesn't exist, throw error if verbose=true*/
	var si = getIndexOfStudentName(s);
	if (si == undefined) {
		if (verbose) {
			console.log('Index for '+s+' could not be found!');
		}
		return false;
	}
	if (getStudentHasClass(si)) {
		return false;
	}
	/*terminate if class doesn't exist, throw error if verbose=true*/
	if (c == undefined) {
		if (verbose) {
			console.log('Class for '+s+' could not be found!');
		}
		return false;
	}
	if (c.FULL !== null && c.AM === null && c.PM === null) {/*if FULLDAY and not AM/PM, assign FULLDAY class if not full etc.*/
		var cF = c.FULL;
		try {
			if (classes[cF].enrolled.length < classes[cF].max) {
				classes[cF].enrolled.push(s);
				setStudentHasClass(index,true);
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
			console.log(cF);
			console.log(s);
		}
	} else if (c.FULL === null && c.AM !== null && c.PM !== null) {/*IF AM/PM and not FULLDAY assign AM/PM if both are not full*/ 
		var cAM = c.AM;
		var cPM = c.PM;
		try {
			if ((classes[cAM].enrolled.length < classes[cAM].max) && (classes[cPM].enrolled.length < classes[cPM].max)) {
				classes[cAM].enrolled.push(s)
				classes[cPM].enrolled.push(s)
				setStudentHasClass(index,true);
				if (verbose) {
					console.log(s+' has been placed in '+cAM+' & '+cPM);
				}
				return true;
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
			console.log(s);
		}
		/*terminate, throw error if verbose=true, also used to mark a user as having a class based on settings*/
	} else if (c.PM === null && students[si].fordSayre === true) {
		var cAM = c.AM;
		try {
			if ((classes[cAM].enrolled.length < classes[cAM].max)) {
				classes[cAM].enrolled.push(s)
				setStudentHasClass(index,true);
				if (verbose) {
					console.log(s+' has been placed in '+cAM+' (Ford Sayre)');
				}
			} else {
				if (verbose) {
					console.log('Class '+cAM+' is full! ('+s+' Ford Sayre)');
				}
				return false;
			}
		} catch (err) {
			console.log('----');
			console.log('ERROR:'+err.message);
			console.log(cAM);
			console.log(s);
		}
	} else {
		if (verbose) {
			console.log('The class data for '+s+' is not valid.');
		}
		if (doNotAssignClassesWhenNoneAreRequested) {
			setStudentHasClass(index,true)
		}
	}
	return true;
}

if (process.argv.indexOf('--verbose') !== -1) {
	verbose = true;
}
if (process.argv.indexOf('--ignore-grades') !== -1) {
	useGrades = false;
}
if (process.argv.indexOf('--classes') !== -1) {
	classFile = process.argv[process.argv.indexOf('--classes') + 1];
}
if (process.argv.indexOf('--students') !== -1) {
	studentsFile = process.argv[process.argv.indexOf('--students') + 1];
}
if (process.argv.indexOf('--output-classes') !== -1) {
	outputClassesFile = process.argv[process.argv.indexOf('--output-classes') + 1];
}
if (process.argv.indexOf('--output-studentsNotPlaced') !== -1) {
	outputStudentsNotPlaced = process.argv[process.argv.indexOf('--output-studentsNotPlaced') + 1];
}

if (process.argv.indexOf('--help') !== -1) {
	console.log('Show all actions');
	console.log('	--verbose');
	console.log('Classes Input File');
	console.log('	--classes [file.json]');
	console.log('Students Input File');
	console.log('	--students [file.json]');
	console.log('Classes Output File');
	console.log('	--output-classes [file.json]');
	console.log('Students Not Placed Output File');
	console.log('	--output-studentsNotPlaced [file.json]');
	console.log('Ignore .grade field');
	console.log('	--ignore-grades');
	process.kill()
}

var classes = readFileSync(classFile);
var students = readFileSync(studentsFile);

var studentRecordsForDuplicates = [];
for (var i = 0; i < students.length; i++) {
	if (studentRecordsForDuplicates.indexOf(students[i].name) !== -1) {
		if (process.argv.indexOf('--force') !== -1) {
			students.splice(i,1);
		} else {
			console.log(students[i].name+' was found twice, names must be unique');
			console.log('Use --force to remove ignore duplicates');
			process.kill();
		}
	} else {
		studentRecordsForDuplicates.push(students[i].name);
	}
};

/*prepares data, hasClass, shouldn't be passed, will be overritten*/
for (var i = 0; i < students.length; i++) {
	setStudentHasClass(i,false);
};
/*randomize student indexes*/
while (studentIndex.length < students.length) {
	var rand = randomIntFromInterval(0,students.length - 1);
	if (studentIndex.indexOf(rand) === -1) {
		studentIndex.push(rand);
	}
}
/*four loops, one for each grade*/
for (var x = 0; x < grades.length; x++) {
	/*three loops, first time won't assign classes not requests*/
	for (var y = 0; y < 3; y++) {
		/*go through random student array*/
		for (var i = 0; i < studentIndex.length; i++) {
			var index = studentIndex[i];
			if (students[index].grade == grades[x] || !useGrades) {
				/*if the student has no class, try to assing their requests*/
				if (getStudentHasClass(index) !== true) {
					/*going from request 1, to last request*/
					for (var n = 0; n < students[index].choices.length; n++) {
						if (placeStudent(students[index].name,students[index].choices[n])) {
							happyness.push(n);
							break;
						}
					}
				}
				if ((randomIntFromInterval(1,2) === 1 || studentRandomData[index] === 2) && studentRandomData[index] !== 1) {
					studentRandomData[index] = 1;
					/*if the student has no class, and not the first loop, assign to random class*/
					if (getStudentHasClass(index) !== true && y !== 0) {
						/*loop classes*/
						for (var n = 0; n < Object.keys(classes).length; n++) {
							var key = Object.keys(classes)[n];
							/*find first FULLDAY type class that isn't empty.*/
							if (classes[key].type == 'FULL') {
								if (placeStudent(students[index].name,{"FULL":key,"AM":null,"PM":null})) {
									happyness.push(students[index].choices.length);
									break;
								}
							}
						}
					}					
				} else {
					studentRandomData[index] = 2;
					if (getStudentHasClass(index) !== true && y !== 0) {
						/*loop classes*/
						for (var n = 0; n < Object.keys(classes).length; n++) {
							var keyAM = Object.keys(classes)[n];
							/*find first AM type class that isn't empty.*/
							if (classes[keyAM].type == 'AM') {
								for (var z = 0; z < Object.keys(classes).length; z++) {
									var keyPM = Object.keys(classes)[z];
									/*find first PM type class that isn't empty.*/
									if (classes[keyPM].type == 'PM') {
										if (placeStudent(students[index].name,{"FULL":null,"AM":keyAM,"PM":keyPM})) {
											happyness.push(students[index].choices.length);
											if (verbose) {
												console.log('Placed AM/PM Random Class!');
											}
											break;
										}
									}
								}
							}
						}
					}
				}
				/*If unable to place the student, put them on the unplaceable list*/
				if (getStudentHasClass(index) !== true && y !== 0) {
					studentUnplaceableIndex.push(index);
				}
			} else {
				if (verbose) {
					console.log('Denied '+students[index].name+' due to '+students[index].grade+' ≠ '+grades[x]);
				}
			}
		}
	}
}
/*look through the student unplaceable index, and replace it with names so that it can be read easier*/
for (var i = 0; i < studentUnplaceableIndex.length; i++) {
	studentUnplaceableIndex[i] = students[studentUnplaceableIndex[i]].name;
};
/*print the success percentage*/
var percentage = (studentIndex.length-studentUnplaceableIndex.length)/studentIndex.length*100;
console.log(Math.round(percentage)+'% placement, where '+(studentIndex.length - studentUnplaceableIndex.length)+' student(s) of '+studentIndex.length+' were placed');
var total = 0;
for (var i = 0; i < happyness.length; i++) {
	total += happyness[i]
};
console.log(total/happyness.length);
/*write files*/
writeFileSync(outputClassesFile, classes);
writeFileSync(outputStudentsNotPlaced, students);
