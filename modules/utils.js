
var node_hash = require('es-hash'); 


module.exports.getTimeStamp = function() {

	var s = '[';

	var currentTime = new Date();

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


module.exports.getStampedHash = function(object) {
	var stampedObject = { o: object, stamp: module.exports.getTimeStamp() }; 
	var hash = node_hash(stampedObject, 'sha256'); 
	return hash; 
}


module.exports.getHash = function(object) {
	var hash = node_hash(object, 'sha256'); 
	return hash; 
}


