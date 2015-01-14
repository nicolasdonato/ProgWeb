/**
 * New node file
 */
var dbManager = require('../dbManager');
//
//Attention dbManager doit avoir été initialisé d'abord
//
module.exports.configure = function(io, socketPath){
	io.
	of(socketPath).
	on('connection', function (socket){
		
		// convenience function to log server messages on the client
		function log(){
			var array = [">>> Message from server:"];
			array.push.apply(array, arguments);
			socket.emit('log', array);
		}

		socket.on('listUsers', function () {
			log('Client asked for users');
			dbManager.list(function(err, userList){

				for(var index in userList){
					log('Found user ' + userList[index].name);
				}
				socket.emit('userList', userList);
			});
			// for a real app, would be room only (not broadcast)
		});

		socket.on('authentification', function (data) {
			log('Client asked for auth with credentials : ' + data.login + " " + data.password);
			dbManager.findByNameAndPassword(data.login, data.password, function(success){
				if(success){
					socket.emit('connectionApproved', data.login + " is authentified");
				}
				else
					{

					socket.emit('connectionRefused');
					}
			});
		});
	});
	
};

