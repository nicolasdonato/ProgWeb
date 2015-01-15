
var logger = require('../logger'); 


module.exports.connect = function(io) {

	io.on('connection', function (socket) {


		function log() {

			var array = [">>> "];
			for (var i = 0; i < arguments.length; i++) {
				array.push(arguments[i]);
			}

			socket.emit('message', { type: 'log', data: array });
		}


		socket.on('message', function (message) {

			if (message.type === 'create or join') {

				var room = message.data;
				var numClients = io.sockets.clients(room).length;

				log('Room ' + room + ' has ' + numClients + ' client(s)');
				log('Request to create or join room', room);

				if (numClients == 0) {

					socket.join(room);
					socket.emit('message', { type: 'created', data: room });

				} else if (numClients == 1) {

					io.sockets.in(room).emit('message', { type: 'join', data: room });
					socket.join(room);
					socket.emit('message', { type: 'joined', data: room });

				} else { 
					socket.emit('message', { type: 'full', data: room });
				}

			} else if (message.type === 'message') {
				log('Got message: ', message);

				socket.broadcast.emit('message', message); 

			} else {
				logger.err('Unknown socket message type <' + message.type + '>'); 
			}
		});

	}); 
}; 
