var fs = require('fs');

var studentIndex = []; /*Used to randomly order students*/
var studentUnplaceableIndex = []; /*Used to track students that were not assigned to a class*/
var happiness = []; /*Used to track how happy students are with their seleciton*/
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

function readJSONSync(file) {
	try {
		return JSON.parse(fs.readFileSync(file, 'utf8'));
	} catch (err) {
		console.log('ERROR:'+err.message);
		return false;
	}
}

function readCSVSync(file) {
	try {
		return fs.readFileSync(file, 'utf8');
	} catch (err) {
		console.log('ERROR:'+err.message);
		return false;
	}
}
function writeJSONSync(file, obj, options) {
	try {
		var str = JSON.stringify(obj, null, module.exports.spaces);
		return fs.writeFileSync(file, str, options);
	} catch (err) {
		console.log('ERROR:'+err.message);
		return false;
	}
}
function writeCSVSync(file, str, options) {
	try {
		return fs.writeFileSync(file, str, options);
	} catch (err) {
		console.log('ERROR:'+err.message);
		return false;
	}
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

function splitCSVRow(row) {
	var deleteIndexes = [];

	row = row.replace(/,,/g,',"",').replace(/,,/g,',"",').replace(/,,/g,',"",');

	if (row.substr(row.length - 1) == ',') {
		row = row + '""';
	}

	if (row.charAt(0) == ',') {
		row = '""' + row;
	}


	row = row.match(/"([^"]|"")*"|[^,\n]*/g);/*"*/

	for (var i = 0; i < row.length; i++) {
		if (row[i].charAt(0) == '"') {
			row[i] = row[i].substr(1);
		}
		if (row[i].charAt(row[i].length-1) == '"') {
			row[i] = row[i].substr(0,row[i].length-1);
		}
		if (i%2) {
			deleteIndexes.push(i);
		}
	}

	for (var i = deleteIndexes.length - 1; i >= 0 ; i--) {
		row.splice(deleteIndexes[i],1);
	}
	return row;
}

function convertRowToJSON(row,head) {
	obj = {"name":"","fordSayre":false,"hartfordTechAM":false,"hartfordTechPM":false,"grade":9,"choices":[{},{},{},{},{},{},{},{}]};
	var row = splitCSVRow(row);
	var head = head.split(',');
	for (var i = 0; i < row.length; i++) {
		if (head[i] === 'name') {
			obj.name = row[i];
		}
		if (head[i] === 'hartfordTech') {
			if (row[i] === 'AM') {
				obj.hartfordTechAM = true;
				obj.hartfordTechPM = false;
			} else if (row[i] === 'PM') {
				obj.hartfordTechPM = true;
				obj.hartfordTechAM = false;
			} else {
				obj.hartfordTechPM = false;
				obj.hartfordTechAM = false;
			}
		}
		if (head[i] === 'fordSayre') {
			if (row[i] === "false") {
				obj.fordSayre === false;
			}
			if (row[i] === "true") {
				obj.fordSayre === true;
			}
		}
		if (head[i] === 'commonGround') {
			obj.commonGround = row[i];
		}
		if (head[i] === 'grade') {
			if (row[i].indexOf(9) !== -1) {
				obj.grade = 9;
			} else if (row[i].indexOf(10) !== -1) {
				obj.grade = 10;
			} else if (row[i].indexOf(11) !== -1) {
				obj.grade = 11;
			} else if (row[i].indexOf(12) !== -1) {
				obj.grade = 12;
			} else {
				obj.grade = 9;
			}
		}
		for (var x = 1; x < 10; x++) {
			if (head[i] === x+'FULL') {
				if (row[i] === "") {
					obj.choices[x-1].FULL = null;
				} else {
					obj.choices[x-1].FULL = row[i];					
				}
			} else if (head[i] === x+'AM') {
				if (row[i] === "") {
					obj.choices[x-1].AM = null;
				} else {
					obj.choices[x-1].AM = row[i];					
				}
			} else if (head[i] === x+'PM') {
				if (row[i] === "") {
					obj.choices[x-1].PM = null;
				} else {
					obj.choices[x-1].AM = row[i];
				}
			}
		}
	}
	return obj;
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
	console.log('	--classes [classes.json]');
	console.log('Students Input File');
	console.log('	--students [students.json]');
	console.log('Classes Output File');
	console.log('	--output-classes [classes-output.json]');
	console.log('Students Not Placed Output File');
	console.log('	--output-studentsNotPlaced [students-output.json]');
	console.log('Convert CSV to JSON');
	console.log('	--convert-csv-json [OPTIONAL students.csv] [OPTIONAL students.json]');
	console.log('Ignore .grade field');
	console.log('	--ignore-grades');
	process.kill()
}

if (process.argv.indexOf('--convert-csv-json') !== -1) {
	var csv = "";
	if (process.argv[process.argv.indexOf('--convert-csv-json')+1] !== undefined) {
		csv = readCSVSync(process.argv[process.argv.indexOf('--convert-csv-json')+1]);
	} else {
		csv = readCSVSync('students.csv');
	}
	var csvOutputJsonFileName = 'students.json';
	if (process.argv[process.argv.indexOf('--convert-csv-json')+2] !== undefined) {
		csvOutputJsonFileName = process.argv[process.argv.indexOf('--convert-csv-json')+2];
	}
	var csvAsJSON = [];

	if (csv.length === 0 || !csv) {
		console.log('The provided CSV file is empty, corrupt, or doesn\'t exist');
		process.kill();
	}

	//csv = csv.replace(/,,/g,',"",').replace(/,,/g,',"",').replace(/,,/g,',"",');/*To prevent overlaps from causing issues*/
	csv = csv.split('\n');
	
	for (var i = 0; i < csv.length; i++) {
		if (i === 0) {
			console.log('Skipping row 1, assuming header row');
		} else {
			var row = convertRowToJSON(csv[i],csv[0]);
			if (row !== false) {
				csvAsJSON.push(row);
			}
		}
	}
	writeJSONSync(csvOutputJsonFileName,csvAsJSON);
	console.log('Wrote file '+csvOutputJsonFileName+' based on data from provided CSV file');
	process.kill();
}