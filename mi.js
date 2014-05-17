var fs = require('fs');

var studentIndex = []; /*Used to randomly order students*/
var studentUnplaceableIndex = []; /*Used to track students that were not assigned to a class*/
var happiness = []; /*Used to track how happy students are with their seleciton*/
var grades = [];
var doNotAssignClassesWhenNoneAreRequested = true; /*If a user doesn't request any classes, they will not be given one and no error will be output*/
var verbose = false; /*Output operations, triggerable with --verbose as well*/
var classFile = 'classes.json';
var studentsFile = 'students.json';
var useGrades = true;
var studentRandomData = {};
var studentClassData = {};

function setStudentHasClass(i,s) { studentClassData[i] = s; return true; }
function getStudentHasClass(i) { return studentClassData[i]; }
function randomIntFromInterval(min,max) { return Math.floor(Math.random()*(max-min+1)+min); }
function writeFile(file, contents, options) { return fs.writeFileSync(file, contents, options); }
function readJSON(file) { return JSON.parse(readFile(file)); }
function readFile(file) { return fs.readFileSync(file, 'utf8'); }
function writeJSON(file, obj, options) { return writeFile(file, JSON.stringify(obj, null, module.exports.spaces), options); }
function getNameOfStudentID(id) {
	console.log(id);
	return students[getIndexOfStudentID(id)].name;
};

function getStudentClass(sid) {
	var classesWithStudent = [];
	for (var i = 0; i < Object.keys(classes).length; i++) {
		var classKey = Object.keys(classes)[i];
		if (classes[classKey].enrolled.indexOf(sid) != -1) {
			classesWithStudent.push(classKey);
		}
	};
	return classesWithStudent;
}
function getIndexOfStudentID(id) {
	for (var i = 0; i < students.length; i++) {
		if (students[i].studentid == id) {
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

	while (0 != currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}
function removeDuplicatesFromArray(arr) {
	for (var i = 0; i < arr.length; i++) {
		for (var y = 0; y < arr.length; y++) {
			if (arr[i] == arr[y] && i != y) {
				arr.splice(y,1);
			}
		}
	}
	return arr;
}
function classRequestDetails(det,cl) {
	if (det == 'type') {
		if (cl.am != undefined && cl.pm != undefined) {
			return 'ampm';
		} else if (cl.full != undefined) {
			return 'full';
		}
	}
}
function placeStudent(sid,c) {
	/*places student s in class c, where possible. c is an object, with keys full, am, and pm, s is a string*/	
	/*terminate if student doesn't exist, throw error if verbose=true*/
	var studentIndex = getIndexOfStudentID(sid);
	if (studentIndex == undefined) {
		if (verbose) {
			console.log('Index for '+getNameOfStudentID(sid)+' could not be found!');
		}
		return false;
	}
	if (getStudentHasClass(studentIndex)) {
		return false;
	}
	/*terminate if class doesn't exist, throw error if verbose=true*/
	if (c == undefined) {
		if (verbose) {
			console.log('Class for '+getNameOfStudentID(sid)+' could not be found!');
		}
		return false;
	}
	if (c.full != undefined && c.am == undefined && c.pm == undefined && students[studentIndex].hartfordTech == 'none' && students[studentIndex].fordSayre == false) {
		var cF = c.full;
		try {
			if (classes[cF].enrolled.length < classes[cF].max) {
				classes[cF].enrolled.push(sid);
				setStudentHasClass(studentIndex,true);
				if (verbose) {
					console.log(getNameOfStudentID(sid)+' has been placed in '+cF);
				}
			} else {
				if (verbose) {
					console.log('Class '+cF+' is full! ('+getNameOfStudentID(sid)+')');
				}
				return false;
			}
		} catch (err) {
			console.log('An error occured. EID:FULL');
			console.log(err.message);
			console.log(cam);
			console.log(students[studentIndex]);
			process.kill();
		}
	} else if (c.full == undefined && c.am != undefined && c.pm != undefined && students[studentIndex].hartfordTech == 'none' && students[studentIndex].fordSayre == false) {
		var cam = c.am;
		var cpm = c.pm;
		try {
			if ((classes[cam].enrolled.length < classes[cam].max) && (classes[cpm].enrolled.length < classes[cpm].max)) {
				classes[cam].enrolled.push(sid);
				classes[cpm].enrolled.push(sid);
				setStudentHasClass(studentIndex,true);
				if (verbose) {
					console.log(getNameOfStudentID(sid)+' has been placed in '+cam+' & '+cpm);
				}
				return true;
			} else {
				if (verbose) {
					console.log('Class '+cpm+' or '+cam+' is full! ('+getNameOfStudentID(sid)+')');
				}
				return false;
			}
		} catch (err) {
			console.log('An error occured. EID:AMPM');
			console.log(err.message);
			console.log(cam);
			console.log(students[studentIndex]);
			process.kill();
		}
		/*terminate, throw error if verbose=true, also used to mark a user as having a class based on settings*/
	} else if (c.am != undefined && students[studentIndex].hartfordTech == 'none' && students[studentIndex].fordSayre == true) {
		var cam = c.am;
		try {
			if ((classes[cam].enrolled.length < classes[cam].max)) {
				classes[cam].enrolled.push(sid);
				setStudentHasClass(studentIndex,true);
				if (verbose) {
					console.log(getNameOfStudentID(sid)+' has been placed in '+cam+' (Ford Sayre)');
				}
			} else {
				if (verbose) {
					console.log('Class '+cam+' is full! ('+getNameOfStudentID(sid)+' Ford Sayre)');
				}
				return false;
			}
		} catch (err) {
			console.log('An error occured. EID:FORDSAYRE');
			console.log(err.message);
			console.log(cam);
			console.log(students[studentIndex]);
			process.kill();
		}
	} else if (students[studentIndex].hartfordTech == 'pm' && students[studentIndex].fordSayre == false && c.am != undefined) {
		var cam = c.am;
		try {
			if ((classes[cam].enrolled.length < classes[cam].max)) {
				classes[cam].enrolled.push(sid)
				setStudentHasClass(studentIndex,true);
				if (verbose) {
					console.log(getNameOfStudentID(sid)+' has been placed in '+cam+' (HTECHAM)');
				}
			} else {
				if (verbose) {
					console.log('Class '+cam+' is full! ('+getNameOfStudentID(sid)+' HTECHAM)');
				}
				return false;
			}
		} catch (err) {
			console.log('An error occured. EID:HTECHAM');
			console.log(err.message);
			console.log(cpm);
			console.log(students[studentIndex]);
			process.kill();
		}
	} else if (students[studentIndex].hartfordTech == 'am' && students[studentIndex].fordSayre == false && c.pm != undefined) {
		var cpm = c.pm;
		try {
			if ((classes[cpm].enrolled.length < classes[cpm].max)) {
				classes[cpm].enrolled.push(sid);
				setStudentHasClass(studentIndex,true);
				if (verbose) {
					console.log(getNameOfStudentID(sid)+' has been placed in '+cpm+' (HTECHPM)');
				}
			} else {
				if (verbose) {
					console.log('Class '+cpm+' is full! ('+getNameOfStudentID(sid)+' HTECHPM)');
				}
				return false;
			}
		} catch (err) {
			console.log('An error occured. EID:HTECHPM');
			console.log(err.message);
			console.log(cpm);
			console.log(students[studentIndex]);
			process.kill();
		}
	} else {
		if (verbose) {
			console.log('The class data for '+getNameOfStudentID(sid)+' is not valid.');
		}
		if (doNotAssignClassesWhenNoneAreRequested) {
			setStudentHasClass(studentIndex,true)
		}
	}
	return true;
}

if (process.argv.indexOf('--verbose') != -1) { verbose = true; }

if (process.argv.indexOf('--config') != -1) {
	var config = readJSON(process.argv[process.argv.indexOf('--classes') + 1]);
} else {
	var config = readJSON('config.json');
}

if (!fs.existsSync('output/')) { fs.mkdir('output'); }
if (config.useGrades != undefined) { useGrades = config.useGrades; }
if (config.grades != undefined) { grades = config.grades; }
if (config.files.input.classes != undefined) { classFile = 'input/'+config.files.input.classes; }
if (config.files.input.students != undefined) { studentsFile = 'input/'+config.files.input.students; }

if (config.updateWebDirectory) {
	if (!fs.existsSync('website/')) {
		fs.mkdir('website');
	}
	if (!fs.existsSync('website/data')) {
		fs.mkdir('website/data');
	}
}

if (config.files.output.classes != undefined) {
	var outputClassesFile = 'output/'+config.files.output.classes;
} else {
	var outputClassesFile = 'output/classes.json';
}
if (config.files.output.studentsNotPlaced != undefined) {
	var outputStudentsNotPlaced = 'output/'+config.files.output.studentsNotPlaced;
} else {
	var outputStudentsNotPlaced = 'output/studentsNotPlaced';
}
if (config.files.output.students != undefined) {
	var outputStudents = 'output/'+config.files.output.students;
} else {
	var outputStudents = 'output/students';
}

if (config.files.output.classes != undefined) {
	var outputWebClassesFile = 'website/data/'+config.files.output.classes;
} else {
	var outputWebClassesFile = 'website/data/classes.json';
}
if (config.files.output.studentsNotPlaced != undefined) {
	var outputWebStudentsNotPlaced = 'website/data/'+config.files.output.studentsNotPlaced;
} else {
	var outputWebStudentsNotPlaced = 'website/data/studentsNotPlaced';
}
if (config.files.output.students != undefined) {
	var outputWebStudents = 'website/data/'+config.files.output.students;
} else {
	var outputWebStudents = 'website/data/students';
}
if (config.doNotAssignClassesWhenNoneAreRequested != undefined) {
	doNotAssignClassesWhenNoneAreRequested = config.doNotAssignClassesWhenNoneAreRequested;
}

if (process.argv.indexOf('--help') != -1) {
	console.log('Show all actions');
	console.log('	--verbose');
	console.log('Custom Config Path');
	console.log('	--config [file.json]');
	process.kill()
}

var classes = readJSON(classFile);
var students = readJSON(studentsFile);

var studentRecordsForDuplicates = [];
for (var i = 0; i < students.length; i++) {
	if (studentRecordsForDuplicates.indexOf(students[i].studentid) != -1) {
		if (process.argv.indexOf('--force') != -1) {
			students.splice(i,1);
		} else {
			console.log(getNameOfStudentID(i)+' was found twice, names must be unique');
			console.log('Use --force to remove ignore duplicates');
			process.kill();
		}
	} else {
		studentRecordsForDuplicates.push(students[i].studentid);
	}
};

for (var i = 0; i < students.length; i++) {
	/*Set ford sayre values*/
	if (students[i].fordSayre != true) {
		students[i].fordSayre = false;
		if (verbose) {
			console.log(getNameOfStudentID(i)+' fordSayre=false');
		}
	}
	if (students[i].hartfordTech != 'none' && students[i].hartfordTech != 'am' && students[i].hartfordTech != 'pm') {
		students[i].hartfordTech = 'none'
		if (verbose) {
			console.log(getNameOfStudentID(i)+' hartfordTech=false');
		}
	}
	for (var x = 0; x < students[i].choices.length; x++) {
		if (students[i].choices[x].full == undefined && students[i].choices[x].am == undefined && students[i].choices[x].pm == undefined) {
			students[i].choices.splice(x,1);
			if (verbose) {
				console.log('Spliced for '+getNameOfStudentID(i));
			}
		}
	};
};
/*prepares data, hasClass*/
for (var i = 0; i < students.length; i++) {
	setStudentHasClass(i,false);
};
/*randomize student indexes*/
shuffle(students);

/*four loops, one for each grade*/
for (var x = 0; x < grades.length; x++) {
	/*three loops, first time won't assign classes not requests*/
	for (var y = 0; y < 3; y++) {
		/*go through random student array*/
		for (var i = 0; i < students.length; i++) {
			var sid = students[i].studentid;
			if (students[i].grade == grades[x] || !useGrades) {
				/*if the student has no class, try to assing their requests*/
				if (getStudentHasClass(i) != true) {
					/*going from request 1, to last request*/
					for (var n = 0; n < students[i].choices.length; n++) {
						if (placeStudent(students[i].studentid,students[i].choices[n])) {
							happiness.push(n);
							break;
						} else {
							if (classRequestDetails('type',students[i].choices[n]) == 'ampm') {
								if (students[i].choices[n].am != undefined) {
									if (classes[students[i].choices[n].am].waitlist == undefined) {
										classes[students[i].choices[n].am].waitlist = [];
									}
									classes[students[i].choices[n].am].waitlist.push(sid+' ('+i+'/ '+JSON.stringify(getStudentClass(sid))+')');
								}
								if (students[i].choices[n].pm != undefined) {
									if (classes[students[i].choices[n].pm].waitlist == undefined) {
										classes[students[i].choices[n].pm].waitlist = [];
									}
									classes[students[i].choices[n].pm].waitlist.push(sid+' ('+i+'/ '+JSON.stringify(getStudentClass(sid))+')');
								}
							} else if (classRequestDetails('type',students[i].choices[n]) == 'full') {
								if (classes[students[i].choices[n].full].waitlist == undefined) {
									classes[students[i].choices[n].full].waitlist = [];
								}
								classes[students[i].choices[n].full].waitlist.push(sid+' ('+i+'/ '+JSON.stringify(getStudentClass(sid))+')');	
							}
						}
					}
				}
				/*If unable to place the student, put them on the unplaceable list*/
				if (getStudentHasClass(i) != true && y != 0) {
					studentUnplaceableIndex.push(students[i].studentid);
				}
			} else {
				if (verbose) {
					console.log('Denied '+getNameOfStudentID(i)+' due to '+students[i].grade+' ≠ '+grades[x]);
				}
			}
		}
	}
}
/*look through the student unplaceable index, and replace it with names so that it can be read easier*/
for (var i = 0; i < studentUnplaceableIndex.length; i++) {
	studentUnplaceableIndex[i] = getNameOfStudentID(studentUnplaceableIndex[i]);
};
/*remove dupe waitlists*/
//for (var i = 0; i < Object.keys(classes).length; i++) {
//	if (classes[Object.keys(classes)[i]].waitlist != undefined) {
//		classes[Object.keys(classes)[i]].waitlist = removeDuplicatesFromArray(classes[Object.keys(classes)[i]].waitlist);
//		console.log(Object.keys(classes)[i]);
//	}
//};
/*print the success percentage*/
var percentage = Math.round((students.length-studentUnplaceableIndex.length)/students.length*100);
if (studentUnplaceableIndex != 0 && percentage == 100) {
	percentage = 99;
}
console.log(percentage+'% placement, where '+(students.length - studentUnplaceableIndex.length)+' student(s) of '+students.length+' were placed');
var total = 0;
for (var i = 0; i < happiness.length; i++) {
	total += happiness[i]
};
var totalZero = 0;
for (var i = 0; i < happiness.length; i++) {
	if (happiness[i] == 0) {
		totalZero++;
	}
};
//console.log(Math.round(100-((total/happiness.length)/8*100))+'% Happiness');
console.log(totalZero);
/*write files*/
writeJSON(outputClassesFile, classes);
writeJSON(outputStudents, students);
writeJSON(outputStudentsNotPlaced, studentUnplaceableIndex);

if (config.updateWebDirectory) {
	writeJSON(outputWebClassesFile, classes);
	writeJSON(outputWebStudents, students);
	writeJSON(outputWebStudentsNotPlaced, studentUnplaceableIndex);
}