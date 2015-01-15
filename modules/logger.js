
var node_fs = require('fs');

var mod_utils = require('./utils'); 


var outLog = 'logs/out.log'; 
var errLog = 'logs/err.log'; 


var out = node_fs.createWriteStream(outLog, {flags: 'a'}); 
var err = node_fs.createWriteStream(errLog, {flags: 'a'}); 


module.exports.out = function (message) {

	var stamp = mod_utils.getTimeStamp();
	var lines = message.split('\n');

	for (var i = 0; i < lines.length; i++) {
		out.write(stamp + ' ' + lines[i] + '\n');
	}
}; 


module.exports.err = function (message) {

	var stamp = mod_utils.getTimeStamp();
	var lines = message.split('\n');

	for (var i = 0; i < lines.length; i++) {
		err.write(stamp + ' ' + lines[i] + '\n');
	}
}; 


module.exports.reset = function () {
	out = node_fs.createWriteStream(outLog, {flags: 'w'}); 
	err = node_fs.createWriteStream(errLog, {flags: 'w'}); 
}
