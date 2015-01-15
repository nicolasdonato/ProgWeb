
var fs = require('fs');


var out = fs.createWriteStream('logs/out.log', {flags: 'a'}); 
var err = fs.createWriteStream('logs/err.log', {flags: 'a'}); 


function getTimeStamp() {

	var s = '[';

	var currentTime = new Date()

	var year = currentTime.getFullYear(); 
	var month = currentTime.getMonth() + 1; 
	var day = currentTime.getDate(); 
	s += year + '-' + month + '-' + day + ' '; 

	var hours = currentTime.getHours()
	var minutes = currentTime.getMinutes()
	if (minutes < 10) {
		minutes = '0' + minutes
	}
	var seconds = currentTime.getSeconds()
	if (seconds < 10) {
		seconds = '0' + seconds
	}
	var milli = currentTime.getMilliseconds(); 
	s += hours + ':' + minutes + ':' + seconds + '.' + milli + ']';

	return s;
}


module.exports.out = function(message) {

	var stamp = getTimeStamp();
	var lines = message.split('\n');

	for (var i = 0; i < lines.length; i++) {
		out.write(stamp + ' ' + lines[i] + '\n');
	}
}; 


module.exports.err = function(message) {

	var stamp = getTimeStamp();
	var lines = message.split('\n');

	for (var i = 0; i < lines.length; i++) {
		err.write(stamp + ' ' + lines[i] + '\n');
	}
}; 
