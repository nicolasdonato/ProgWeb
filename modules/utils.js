
module.exports.getTimeStamp = function () {

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


