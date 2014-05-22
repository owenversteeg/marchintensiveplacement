var fs = require('fs');

var doNotAssignClassesWhenNoneAreRequested = true; // If a user doesn't request any classes, they will not be given one and no error will be output
var verbose = false; // Output operations, triggerable with --verbose as well
var classFile = 'classes.json', studentsFile = 'students.json', useGrades = true, studentRandomData = {}, studentClassData = {}, grades = [], happiness = [], studentUnplaceableIndex = [];

function setStudentHasClass(id, s) { studentClassData[id] = s; return true; }
function getStudentHasClass(id) { return studentClassData[id]; }
function randomIntFromInterval(min,max) { return Math.floor(Math.random()*(max-min+1)+min); }
function writeFile(file, contents, options) { return fs.writeFileSync(file, contents, options); }
function readJSON(file) { return JSON.parse(readFile(file)); }
function readFile(file) { return fs.readFileSync(file, 'utf8'); }
function writeJSON(file, obj, options) { return writeFile(file, JSON.stringify(obj, null, module.exports.spaces), options); }
function getNameOfStudentID(id) { var index = getIndexOfStudentID(id); if (index) { return students[index].name; } else { return id; } }
function vlog(message) { if (verbose) console.log(message); }

function verifyClassRequirements(sid, cl) {
	if (!classes[cl].requirements || classes[cl].requirements.length === 0) {
		return true;
	}
	for (var i = 0; i < Object.keys(classes[cl].requirements).length; i++) {
		var key = Object.keys(classes[cl].requirements)[i];
		return (classes[cl].requirements[key] === students[getIndexOfStudentID(sid)][key])
	}
}

function getStudentClass(sid) {
	var classesWithStudent = [];
	for (var i=0; i < Object.keys(classes).length; i++) {
		var classKey = Object.keys(classes)[i];
		if (classes[classKey].enrolled.indexOf(sid) !== -1) {
			classesWithStudent.push(classKey);
		}
	}
	return classesWithStudent;
}

function getIndexOfStudentID(id) {
	for (var i = 0; i < students.length; i++) {
		if (students[i].studentid === id) {
			return i;
		}
	}
	return false;
}

function shuffle(array) {
	// shuffles an array
	var currentIndex = array.length, temporaryValue, randomIndex;

	while (0 !== currentIndex) {
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
		if (arr.indexOf(arr[i]) !== 1) arr.splice(i,1);
	}
	return arr;
}

function classRequestDetails(det, cl) {
	if (det === 'type') {
		if (cl.am && cl.pm) {
			return 'ampm';
		} else if (cl.full) {
			return 'full';
		}
	}
}

function placeStudent(sid, c) {
	// places student s in class c, where possible. c is an object, with keys full, am, and pm, s is a string
	// terminate if student doesn't exist, throw error if verbose=true
	var studentIndex = getIndexOfStudentID(sid), requestClasses = [];
	if (!studentIndex) {
		vlog('Index for '+getNameOfStudentID(sid)+' could not be found!');
		return false;
	}
	if (getStudentHasClass(sid)) {
		return false;
	}
	// terminate if class doesn't exist, throw error if verbose=true
	if (!c) {
		vlog('Class for '+getNameOfStudentID(sid)+' could not be found!');
		return false;
	}
	// verify all possible combinations of class choices and fordSayre/hartfordTech settings
	if (students[studentIndex].hartfordTech === 'none' && !students[studentIndex].fordSayre) {
		requestClasses = requestClasses.concat(c.full || [c.am, c.pm]);
	} else if (c.am && students[studentIndex].hartfordTech === 'none' && students[studentIndex].fordSayre === true) {
		requestClasses.push(c.am);
	} else if (c.am && students[studentIndex].hartfordTech === 'pm' && students[studentIndex].fordSayre === false) {
		requestClasses.push(c.am);
	} else if (c.pm && students[studentIndex].hartfordTech === 'am' && students[studentIndex].fordSayre === false) {
		requestClasses.push(c.pm);
	} else {
		vlog('The class data for '+getNameOfStudentID(sid)+' is not valid.');
		return false;
	}

	if (requestClasses.indexOf(undefined) !== -1) {
		vlog('The student '+students[studentIndex].name+' had an AM without a PM or vice versa.');
		return false;
	}

	if (requestClasses.length === 1) {
		if (classes[requestClasses[0]].enrolled.length < classes[requestClasses[0]].max) {
			classes[requestClasses[0]].enrolled.push(sid);
			setStudentHasClass(sid,true);
		} else {
			return false;
		}
	} else if (requestClasses.length === 2) {
		if ((classes[requestClasses[0]].enrolled.length < classes[requestClasses[0]].max) && (classes[requestClasses[1]].enrolled.length < classes[requestClasses[1]].max)) {
			classes[requestClasses[0]].enrolled.push(sid);
			classes[requestClasses[1]].enrolled.push(sid);
			setStudentHasClass(sid,true);
		} else {
			return false;
		}
	} else {
		return false;
	}
	return true;
}

verbose = (process.argv.indexOf('--verbose') !== -1);

if (process.argv.indexOf('--config') !== -1) {
	var config = readJSON(process.argv[process.argv.indexOf('--classes') + 1]);
} else {
	var config = readJSON('config.json');
}

if (!fs.existsSync('output/')) { fs.mkdir('output'); }
if (config.useGrades) { useGrades = config.useGrades; }
if (config.grades) { grades = config.grades; }
if (config.files.input.classes) { classFile = 'input/'+config.files.input.classes; }
if (config.files.input.students) { studentsFile = 'input/'+config.files.input.students; }

if (config.updateWebDirectory) {
	if (!fs.existsSync('website/'))     fs.mkdir('website');
	if (!fs.existsSync('website/data')) fs.mkdir('website/data');
}

var outputClassesFile = 'output/' + (config.files.output.classes || 'classes.json');
var outputStudentsNotPlaced = 'output/' + (config.files.output.studentsNotPlaced || 'studentsNotPlaced');
var outputStudents = 'output/'+ (config.files.output.students || 'students');
var outputWebClassesFile = 'website/data/' + (config.files.output.classes || 'classes.json');
var outputWebStudentsNotPlaced = 'website/data/'+ (config.files.output.studentsNotPlaced || 'studentsNotPlaced');
var outputWebStudents = 'website/data/' + (config.files.output.students || 'students');

if (config.doNotAssignClassesWhenNoneAreRequested) {
	doNotAssignClassesWhenNoneAreRequested = config.doNotAssignClassesWhenNoneAreRequested;
}

if (process.argv.indexOf('--help') !== -1) {
	console.log('Show all actions\n	--verbose\nCustom Config Path\n	--config [file.json]');
	process.kill()
}

var classes = readJSON(classFile), students = readJSON(studentsFile);

var studentRecordsForDuplicates = [];
for (var i = 0; i < students.length; i++) {
	if (studentRecordsForDuplicates.indexOf(students[i].name) !== -1 || studentRecordsForDuplicates.indexOf(students[i].studentid) !== -1) {
		if (process.argv.indexOf('--force') !== -1) {
			students.splice(i,1);
		} else {
			console.log('The student with name' + students[i].name + 'and student ID ' + students[i].studentid + ' was found twice; both names and student IDs must be unique. \nUse --force to remove ignore duplicates');
			process.kill();
		}
	} else {
		studentRecordsForDuplicates.push(students[i].name, students[i].studentid);
	}
}

for (var i=0; i < students.length; i++) {
	// Set ford sayre values
	students[i].fordSayre = !!students[i].fordSayre;
	if (students[i].hartfordTech !== 'none' && students[i].hartfordTech !== 'am' && students[i].hartfordTech !== 'pm') {
		students[i].hartfordTech = 'none'
		vlog(getNameOfStudentID(students[i].studentid)+' hartfordTech=false');
	}
	for (var x = 0; x < students[i].choices.length; x++) {
		if (!students[i].choices[x].full && !students[i].choices[x].am && !students[i].choices[x].pm) {
			students[i].choices.splice(x,1);
			vlog('Spliced for '+getNameOfStudentID(students[i].studentid));
		}
		if (students[i].choices[x].full && students[i].choices[x].am && students[i].choices[x].pm) {
			if (students[i].choices.length < 8)  {
				students[i].choices.push({"am":students[i].choices[x].am,"pm":students[i].choices[x].pm});
			}
			delete students[i].choices[x].am;
			delete students[i].choices[x].pm;
		}
		if (students[i].choices[x].full && students[i].choices[x].am && !students[i].choices[x].pm) {
			delete students[i].choices[x].am;
		}
		if (students[i].choices[x].full && students[i].choices[x].pm && !students[i].choices[x].am) {
			delete students[i].choices[x].pm;
		}
	}
}
// prepares data, hasClass
for (var i = 0; i < students.length; i++) {
	setStudentHasClass(students[i].studentid, false);
}
// randomize student indexes
students = shuffle(students);

// four loops, one for each grade
for (var x = 0; x < grades.length; x++) {
	// go through random student array
	for (var i = 0; i < students.length; i++) {
		var sid = students[i].studentid;
		if ((students[i].grade === grades[x] || !useGrades) && !getStudentHasClass(sid)) {
			// if the student has no class, try to assing their requests
			// going from request 1, to last request
			for (var n = 0; n < students[i].choices.length; n++) {
				if (placeStudent(students[i].studentid,students[i].choices[n])) {
					if (n !== 0) {
						// place students on waitlist
						if (classRequestDetails('type',students[i].choices[n-1]) === 'ampm') {
							if (students[i].choices[n-1].am) {
								if (classes[students[i].choices[n-1].am].waitlist === undefined) {
									classes[students[i].choices[n-1].am].waitlist = [];
								}
								classes[students[i].choices[n-1].am].waitlist.push(getNameOfStudentID(sid)+' placed in '+n+':'+getStudentClass(sid)+', wanted '+classes[students[i].choices[n-1].am].name+' and '+classes[students[i].choices[n-1].pm].name);
							}
							if (students[i].choices[n-1].pm) {
								if (classes[students[i].choices[n-1].pm].waitlist === undefined) {
									classes[students[i].choices[n-1].pm].waitlist = [];
								}
								classes[students[i].choices[n-1].pm].waitlist.push(getNameOfStudentID(sid)+' placed in '+n+':'+getStudentClass(sid)+', wanted '+classes[students[i].choices[n-1].am].name+' and '+classes[students[i].choices[n-1].pm].name);
							}
						} else if (classRequestDetails('type',students[i].choices[n-1]) == 'full') {
							if (classes[students[i].choices[n-1].full].waitlist === undefined) {
								classes[students[i].choices[n-1].full].waitlist = [];
							}
							classes[students[i].choices[n-1].full].waitlist.push(getNameOfStudentID(sid)+' placed in '+n+':'+getStudentClass(sid)+', wanted '+classes[students[i].choices[n-1].full].name);
						}
					}
					happiness.push(n);
					break;
				}
			}
		} else {
			vlog('Denied '+getNameOfStudentID(students[i].studentid)+' due to '+students[i].grade+' ≠ '+grades[x]);
		}
	}
}
for (var i = 0; i < students.length; i++) {
	// If unable to place the student, put them on the unplaceable list
	if (!getStudentHasClass(students[i].studentid)) {
		studentUnplaceableIndex.push(students[i].studentid);
		happiness.push(8);
	}
};
// look through the student unplaceable index, and replace it with names so that it can be read easier
for (var i = 0; i < studentUnplaceableIndex.length; i++) {
	studentUnplaceableIndex[i] = getNameOfStudentID(studentUnplaceableIndex[i]);
}
// remove dupe waitlists
for (var i = 0; i < Object.keys(classes).length; i++) {
	var key = Object.keys(classes);
	if (classes[key[i]].waitlist) {
		classes[key[i]].waitlist = removeDuplicatesFromArray(classes[key[i]].waitlist);
	}
}
// print the success percentage to two decimal places
var percentage = Math.round((students.length-studentUnplaceableIndex.length)/students.length*10000)/100;
if (studentUnplaceableIndex !== 0 && percentage === 100) {
	percentage = 99; // you liar
}
console.log(percentage+'% placement, where '+(students.length - studentUnplaceableIndex.length)+' student(s) of '+students.length+' were placed');
var total = 0;
for (var i = 0; i < happiness.length; i++) {
	total += (8 - happiness[i]);
}
vlog("Total: " + total / 8);
vlog("Count: " + happiness.length);
console.log("Happiness: " + Math.floor(100 * ((total / 8) / happiness.length)) + "%");

var totalZero = 0;
for (var i = 0; i < happiness.length; i++) {
	if (happiness[i] === 0) totalZero++;
}
for (var i = 0; i < Object.keys(classes).length; i++) {
	var classKey = Object.keys(classes)[i];
	for (var n = 0; n < classes[classKey].enrolled.length; n++) {
		classes[classKey].enrolled[n] = getNameOfStudentID(classes[classKey].enrolled[n]);
	}
}
// console.log(Math.round(100-((total/happiness.length)/8*100))+'% Happiness');
// console.log(totalZero);

// write files
writeJSON(outputClassesFile, classes);
writeJSON(outputStudents, students);
writeJSON(outputStudentsNotPlaced, studentUnplaceableIndex);

if (config.updateWebDirectory) {
	writeJSON(outputWebClassesFile, classes);
	writeJSON(outputWebStudents, students);
	writeJSON(outputWebStudentsNotPlaced, studentUnplaceableIndex);
}
