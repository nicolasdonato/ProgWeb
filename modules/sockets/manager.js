
var logger = require('../logger'); 

var http = require("http");
module.exports.connect = function(io) {

	io.on('connection', function (socket) {

		function getServersTurn() {
			http.get("http://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913", function(res) {
				console.log("Got response: " + res.statusCode);
				res.on('data', function(data) {
					var tmp=""+data; 
					console.log("Got server Turn: " + tmp);
					log("Got server Turn: " + tmp);
					socket.emit('webrtc_component', { type: 'serversTurn', data: tmp });
				});
			}).on('error', function(e) {
				console.log("Got error: " + e.message);
			});
		}
		
		function log() {

			var array = [">>> [socket] "];
			for (var i = 0; i < arguments.length; i++) {
				array.push(arguments[i]);
			}

			socket.emit('message', { type: 'log', data: array });
		}


		socket.on('message', function (message) {

			if (message.type === 'create or join') {
				getServersTurn();
				var room = message.data;
				var numClients = io.sockets.clients(room).length;

				log('Room ' + room + ' has ' + numClients + ' client(s)');
				log('Request to create or join room', room);

				if (numClients == 0) {

					socket.join(room);
					socket.emit('message', { type: 'created', data: room });

				} else if (numClients <= 10) { // TODO trouver un autre moyen pour produire la limite des rooms

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
				
				log('Got ' + message.type + ' about webrtc_component: ', message);
				// ajout de la session de la socket
				message.data.socketId = socket.id;
				socket.broadcast.emit('webrtc_component', message);
				
			} else if (message.type === 'offer') {
				
				log('Got ' + message.type + ' about webrtc_component: ', message);
				// socket.broadcast.emit('webrtc_component', message); // ne pas envoyer en broadcast mais au memberReceiver
				message.data.socketIdSender = socket.id;
				io.sockets.socket(message.data.socketIdReceiver).emit('webrtc_component', message);
			
			} else if (message.type === 'answer') {
			
				log('Got ' + message.type + ' about webrtc_component: ', message);
				// socket.broadcast.emit('webrtc_component', message); // ne pas envoyer en broadcast mais au memberReceiver
				io.sockets.socket(message.data.socketIdReceiver).emit('webrtc_component', message);
				
			} else if (message.type === 'candidate') {
			
				log('Got ' + message.type + ' about webrtc_component: ', message);
				socket.broadcast.emit('webrtc_component', message);
				
			} else if (message.type === 'bye') {
				
				log('Got ' + message.type + ' about webrtc_component: ', message);
				socket.broadcast.emit('webrtc_component', message);
				
			} else {
				logger.err('Unknown socket message type <' + message.type + '> for the webrtc_component'); 
			}
		});

		socket.on('geolocalisation_component', function(message) {
			if (message.type === 'geolocation') {
				
				log('Got ' + message.type + ' about geolocalisation_component: ', message);
				socket.broadcast.emit('geolocalisation_component', message);
				
			} else if (message.type === 'bye') {
				
				log('Got ' + message.type + ' about geolocalisation_component: ', message);
				socket.broadcast.emit('geolocalisation_component', message);
				
			} else {
				logger.err('Unknown socket message type <' + message.type + '> for the geolocalisation_component'); 
			}
		});
	}); 
}; 
