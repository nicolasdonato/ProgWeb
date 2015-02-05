
var mod_db_users = require('../db/users'); 
var mod_db_sessions = require('../db/sessions'); 


module.exports.configure = function (io, socketPath) {
	
	io.of(socketPath).on('connection', function (socket) {


		function log() {
			
			var array = [">>> [authentication] "];
			array.push.apply(array, arguments);
			
			socket.emit('log', array);
		}

		
		socket.on('listUsers', function () {
			log('Client asked for users');
			
			mod_db_users.list(function(userInfo) {
				
				for (var index in userInfo.result) {
					log('Found user ' + userInfo.result[index].login);
				}
				
				socket.emit('userList', userInfo.result);
			});
		});

		
		socket.on('authentication', function (data) {
			log('Client asked for auth with credentials <' + data.login + "," + data.password + ">");
			
			mod_db_sessions.login(data.login, data.password, function (sessionInfo) {
				
				if (sessionInfo.success) {
					socket.emit('connectionApproved', sessionInfo.result);
				} else {
					socket.emit('connectionRefused');
				}
			});
		});
		
	});
};

