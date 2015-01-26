
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
			
			mod_db_users.listUsers(function(err, userList) {
				
				for (var index in userList) {
					log('Found user ' + userList[index].login);
				}
				
				socket.emit('userList', userList);
			});
		});

		
		socket.on('authentification', function (data) {
			log('Client asked for auth with credentials <' + data.login + "," + data.password + ">");
			
			mod_db_sessions.login(data.login, data.password, function (result) {
				
				if (result.authenticated) {
					socket.emit('connectionApproved', result);
				} else {
					socket.emit('connectionRefused');
				}
			});
		});
		
	});
};

