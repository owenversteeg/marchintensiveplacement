var jf = require('jsonfile');
var util = require('util');

var classes = jf.readFileSync('classes.json');
var students = jf.readFileSync('students.json');

var studentIndex = [];

var studentUnplaceableIndex = [];

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
		console.log('Index for '+s+' could not be found!');
		return false;
	}
	if (c == undefined) {
		console.log('Class for '+s+' could not be found!');
		return false;
	}
	if (c.FULL !== null && c.AM === null && c.PM === null) {
		var cF = c.FULL;

		if (classes[cF].enrolled.length < classes[cF].max) {
			classes[cF].enrolled.push(s);
			console.log(s+' has been placed in '+cF);
		} else {
			console.log('Class '+cF+' is full! ('+s+')');
			return false;
		}
	} else if (c.FULL === null && c.AM !== null && c.PM !== null) {
		var cAM = c.AM;
		var cPM = c.PM;

		if ((classes[cAM].enrolled.length < classes[cAM].max) && (classes[cPM].enrolled.length < classes[cPM].max)) {
			classes[cAM].enrolled.push(s)
			classes[cPM].enrolled.push(s)
			console.log(s+' has been placed in '+cAM+' & '+cPM);
		} else {
			console.log('Class '+cPM+' or '+cAM+' is full! ('+s+')');
			return false;
		}
	} else {
		console.log(c);
	}
	return true;
}

while (studentIndex.length < students.length) {
	var rand = randomIntFromInterval(0,students.length - 1);
	if (studentIndex.indexOf(rand) === -1) {
		studentIndex.push(rand);
	}
}

for (var i = 0; i < studentIndex.length; i++) {
	var index = studentIndex[i];
	var placed = false;
	for (var n = 0; n < students[index].choices.length; n++) {
		if (placeStudent(students[index].name,students[index].choices[n])) {
			placed = true;
			break;
		}
	};
	if (!placed) {
		for (var n = 0; n < Object.keys(classes).length; n++) {
			var key = Object.keys(classes)[n];
			if (placeStudent(students[index].name,key)) {
				placed = true;
				break;
			}
		};
	}
	if (!placed) {
		studentUnplaceableIndex.push(index);
	}
};
var percentage = (studentIndex.length-studentUnplaceableIndex.length)/studentIndex.length*100;
console.log(Math.round(percentage)+'% placement, where '+(studentIndex.length - studentUnplaceableIndex.length)+' student(s) of '+studentIndex.length+' were placed');
jf.writeFileSync('classes-output.json', classes);