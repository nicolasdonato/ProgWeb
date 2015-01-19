
var logger = require('../logger'); 


module.exports.connect = function(io) {

	io.on('connection', function (socket) {


		function log() {

			var array = [">>> [socket] "];
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
				
			} else if (message.type === 'messageChat') {
				
				log('Got ' + message.type + ': ', message);
				socket.broadcast.emit('message', message);
				
			} else {
				logger.err('Unknown socket message type <' + message.type + '>'); 
			}
		});
		
		socket.on('webrtc_component', function(message) {
			if (message.type === 'got user media') {
				
				log('Got ' + message.type + ': ', message);
				socket.broadcast.emit('webrtc_component', message);
				
			} else if (message.type === 'offer') {
				
				log('Got ' + message.type + ': ', message);
				socket.broadcast.emit('webrtc_component', message);
			
			} else if (message.type === 'answer') {
			
				log('Got ' + message.type + ': ', message);
				socket.broadcast.emit('webrtc_component', message);
				
			} else if (message.type === 'candidate') {
			
				log('Got ' + message.type + ': ', message);
				socket.broadcast.emit('webrtc_component', message);
				
			} else if (message.type === 'bye') {
				
				log('Got ' + message.type + ': ', message);
				socket.broadcast.emit('webrtc_component', message);
				
			} else {
				logger.err('Unknown socket message type <' + message.type + '> for the webrtc_component'); 
			}
		});

		socket.on('geolocalisation_component', function(message) {
			if (message.type === 'geolocation') {
				
				log('Got ' + message.type + ': ', message);
				socket.broadcast.emit('geolocalisation_component', message);
				
			} else {
				logger.err('Unknown socket message type <' + message.type + '> for the geolocalisation_component'); 
			}
		});
	}); 
}; 
