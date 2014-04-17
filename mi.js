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

function placeStudent(s,c,doPlace) {
	if (doPlace == undefined) {
		var doPlace = true;
	}
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
	if (classes[c].enrolled.length < classes[c].max) {
		if (doPlace) {
			classes[c].enrolled.push(s)
			students[si].class = c;
		}
	} else {
		console.log('Class '+c+' is full! ('+s+')');
		return false;
	}
	console.log(s+' has been placed in '+c);
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
console.log(Math.round(percentage)+'% placement, where '+studentUnplaceableIndex.length+' student(s) could not be placed');
jf.writeFileSync('classes-output.json', classes);
jf.writeFileSync('students-output.json', students);