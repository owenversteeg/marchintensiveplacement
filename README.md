March-Intensive-Placement
=========================

Creates placement data for March Intensive Classes

### Usage
Node: `brew install node`

Running: `node mi.js[ --help]`

### Config

The config file allows manipulating of the way the program runs

Default:
```
{
	"doNotAssignClassesWhenNoneAreRequested": true,
	"files": {
		"input": {
			"classes": "classes.json",
			"students": "students.json"
		},
		"output": {
			"classes": "classes.json",
			"studentsNotPlaced": "studentsNotPlaced.json",
			"students": "students.json"
		}
	},
	"grades": [
		12,
		11,
		10,
		9
	],
	"useGrades": true
}
```
