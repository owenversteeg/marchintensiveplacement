var jf = require('jsonfile');
var util = require('util');

var classes = jf.readFileSync('classes.json');
var students = jf.readFileSync('students.json');

var studentIndex = [];

var studentUnplaceableIndex = [];

var verbose = false;

function shuffle(array) {
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

function removeVal(array,value) {
	var index = array.indexOf(value);
	if (index > -1) {
		array.splice(index, 1);
	}
	return array;
}

function randomIntFromInterval(min,max) {
	return Math.floor(Math.random()*(max-min+1)+min);
}

function placeStudent(s,c) {
	var si;
	for (var i = 0; i < students.length; i++) {
		if (students[i].name = s) {
			si = i;
			break;
		}
	};
	if (si == undefined) {
		if (verbose) {
			console.log('Index for '+s+' could not be found!');
		}
		return false;
	}
	if (c == undefined) {
		if (verbose) {
			console.log('Class for '+s+' could not be found!');
		}
		return false;
	}
	if (c.FULL !== null && c.AM === null && c.PM === null) {
		var cF = c.FULL;
		try {
			if (classes[cF].enrolled.length < classes[cF].max) {
				classes[cF].enrolled.push(s);
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
	} else if (c.FULL === null && c.AM !== null && c.PM !== null) {
		var cAM = c.AM;
		var cPM = c.PM;
		try {
			if ((classes[cAM].enrolled.length < classes[cAM].max) && (classes[cPM].enrolled.length < classes[cPM].max)) {
				classes[cAM].enrolled.push(s)
				classes[cPM].enrolled.push(s)
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
	} else {
		if (verbose) {
			console.log('The class data for '+s+' is not valid.');
		}
	}
	return true;
}

for (var i = 0; i < students.length; i++) {
	students[i].hasClass = false;
};

while (studentIndex.length < students.length) {
	var rand = randomIntFromInterval(0,students.length - 1);
	if (studentIndex.indexOf(rand) === -1) {
		studentIndex.push(rand);
	}
}
for (var y = 0; y < 2; y++) {
	for (var i = 0; i < studentIndex.length; i++) {
		var index = studentIndex[i];
		var placed = false;
		if (students[index].hasClass !== true) {
			for (var n = 0; n < students[index].choices.length; n++) {
				if (placeStudent(students[index].name,students[index].choices[n])) {
					placed = true;
					students[index].hasClass = true;
					break;
				}
			}
		}
		if (!placed && y !== 0) {
			for (var n = 0; n < Object.keys(classes).length; n++) {
				var key = Object.keys(classes)[n];
				if (classes[key].type == 'FULL') {
					if (placeStudent(students[index].name,{"FULL":key,"AM":null,"PM":null})) {
						placed = true;
						break;
					}
				}
			};
		}
		if (!placed && y !== 0) {
			studentUnplaceableIndex.push(index);
		}
	};
};

for (var i = 0; i < studentUnplaceableIndex.length; i++) {
	studentUnplaceableIndex[i] = students[studentUnplaceableIndex[i]].name;
};

var percentage = (studentIndex.length-studentUnplaceableIndex.length)/studentIndex.length*100;
console.log(Math.round(percentage)+'% placement, where '+(studentIndex.length - studentUnplaceableIndex.length)+' student(s) of '+studentIndex.length+' were placed');
jf.writeFileSync('classes-output.json', classes);
jf.writeFileSync('students-output.json', studentUnplaceableIndex);
