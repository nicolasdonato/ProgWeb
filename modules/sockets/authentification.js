
var dbManager = require('../db/manager'); // WARNING: DB must have been initialized before !


module.exports.configure = function(io, socketPath) {
	
	io.of(socketPath).on('connection', function (socket) {

		/* 
		 * Send traces to client
		 */
		function log() {
			var array = [">>> Message from server: "];
			array.push.apply(array, arguments);
			socket.emit('log', array);
		}

		socket.on('listUsers', function () {
			
			log('Client asked for users');
			
			dbManager.list(function(err, userList) {
				for(var index in userList) {
					log('Found user ' + userList[index].name);
				}
				socket.emit('userList', userList);
			});
			// for a real app, would be room only (not broadcast)
		});

		socket.on('authentification', function (data) {
			
			log('Client asked for auth with credentials : ' + data.login + " " + data.password);
			
			dbManager.findByNameAndPassword(data.login, data.password, function(success) {
				if(success) {
					socket.emit('connectionApproved', data.login + " is authentified");
				} else {
					socket.emit('connectionRefused');
				}
			});
		});
		
	});
};

