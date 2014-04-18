March-Intensive-Placement
=========================

Creates placement data for March Intensive Classes

### Usage
Node: `brew install node`

Running: `node mi.js[ --help]`

```
├── classes.json
├── students.json
└── mi.js
```

### Data
This program takes two sets of datas. An array of users and their choices (students.json)

```
[
	{
		"name": "John Smith",
		"grade": 10,
		"fordSayre": true,
		"choices": [
			{
				"AM": "Example AM Class",
				"PM": "Example PM Class",
				"FULL": null
			}
		]
	},
	...
]
```
and an array of classes (classes.json)
```
{
	"Buzz 101: The Keeping of Bees": {
		"max": "10",
		"type": "AM",
		"enrolled": []
	},
	...
}
```
You can supply data in the enrolled field (strings, full name: i.e. `[ "John Smith" ]` and it will not be overwritten and the class will fill up around it.

### Output
Output is provided in the form of the class list (classes-output.json)

### Method
The steps taken to randomly place people are as follows:

1. A randomly ordered array of indexes is generated. For example, `[ 1, 0, 4, 2, 3 ]` that includes every single student, but has no duplicates and only includes valid student indexes. An index of 0 corresponds to the first user in students.json
2. After the array is generated, a for loop goes through each user and subsequently through their choices array. It tries to place them in their top class, when that fails (i.e. class is full) it goes to second, then third, etc. When the student cannot be placed in any of their choice classes the program loops through every class and finds the first open slot. In future versions, they will happen after every other student has been sent through the first part
3. Students that cannot be placed, either due to a pro grammatical error, or lack of space, are recorded in the students-output.json, as well as a console output

### Data Manipulation

`(.*)\t(.*)\t(.*)\n` -> `{"FULL":"$1","AM":"$2","PM":"$3"}\n`
Make sure to put a newline at the end of the file, or the last one one be counted. Or, add a empty line at the end of the spreadsheet

`(.*) (.*)\t(.*)\t(.*)\t(.*)\t(.*)\t(.*)\t(.*)\t(.*)\t(.*)\t(.*)\n` -> `{"name":"$1","grade":"$2","choices":[$3,$4,$5,$6,$7,$8,$9,$10]},\n`
Remember to put a newline on the last line so that you don't have to properly do

`:""` -> `:null`

` \(T\)` -> ` `
