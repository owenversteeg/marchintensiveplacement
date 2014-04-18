var fs = require('fs');
var express = require('express');
var app = express();

function readFileSync(file) {
	return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function writeFileSync(file, obj, options) {
	var str = JSON.stringify(obj, null, module.exports.spaces);
	return fs.writeFileSync(file, str, options); //not sure if fs.writeFileSync returns anything, but just in case
}

var classFile = 'classes.json';
var studentsFile = 'students.json';
var outputClassesFile = 'classes-output.json';
var outputStudentsNotPlaced = 'students-output.json';

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
app.use(express.directory('public'))
app.use(express.static('public'))
app.listen(3000);