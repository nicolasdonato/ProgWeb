
var mod_db_auth = require('../db/authentification'); // WARNING: DB must have been initialized before !


module.exports.configure = function (io, socketPath) {
	
	io.of(socketPath).on('connection', function (socket) {


		function log() {
			var array = [">>> [authentification] "];
			array.push.apply(array, arguments);
			socket.emit('log', array);
		}

		
		socket.on('listUsers', function () {
			log('Client asked for users');
			
			mod_db_auth.list(function(err, userList) {
				
				for (var index in userList) {
					log('Found user ' + userList[index].name);
				}
				
				socket.emit('userList', userList);
			});
		});

		
		socket.on('authentification', function (data) {
			log('Client asked for auth with credentials <' + data.login + "," + data.password + ">");
			
			mod_db_auth.login(data.login, data.password, function (success, object) {
				
				if (success) {
					socket.emit('connectionApproved', object);
				} else {
					socket.emit('connectionRefused');
				}
			});
		});
		
	});
};

