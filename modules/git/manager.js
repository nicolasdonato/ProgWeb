
var node_events = require('events');

var logger = require('../logger'); 


var eventEmitter = new node_events.EventEmitter();


module.exports.initialize = function(io) {

	eventEmitter.on('refreshFileList', function(event) {

		io.sockets.in(event.room).emit('message', { type: 'refreshFileList', data: event.file });
	});
}; 


module.exports.refresh = function() {

	eventEmitter.emit('refreshFileList', { room: "foo", file: null });
}; 


module.exports.get = function(filename) {

	logger.out('Trying to get file <' + filename + '> from GIT'); 
}; 
