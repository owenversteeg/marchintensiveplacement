var fs = require('fs');

var studentsFile = 'students.json';

function readJSON(file) {
	return JSON.parse(readFile(file));
}
function readFile(file) {
	return fs.readFileSync(file, 'utf8');
}
function writeJSON(file, obj, options) {
	var str = JSON.stringify(obj, null, module.exports.spaces);
	return writeFile(file, str, options); //not sure if fs.writeJSON returns anything, but just in case
}
function writeFile(file, contents, options) {
	return fs.writeFileSync(file, contents, options);
}

var students = readJSON(studentsFile);

for (var i = 0; i < students.length; i++) {
	students[i]
};