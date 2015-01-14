var portNumber = 8888;

var os = require('os');
var express = require('express');
var http = require('http');

var app = express();
require('./modules/config').config(app, express);
// Définition des routes
require('./modules/routes').setup(app);
// Lancement du serveur
var server = http.createServer(app).listen(portNumber);/*process.env.port || */

var dbManager = require('./modules/dbManager');

var dbName = "GEOCHAT";

dbManager.initialize(dbName);

var io = require('socket.io').listen(server);

var connectionSocket = require('./modules/sockets/authentification');

connectionSocket.configure(io, "/auth");

//M.Buffa. Rappel des trois syntaxes de socket.io
//socket = un tuyau relié à un client. C'est un objet unique par client.
//   Donc si on fait socket.n = 3; c'est comme si on ajoutait une propriété
//		"n" à la session dédiée au client connecté. 
//socket.emit(type_message, data) = envoie un message juste au client connecté
//socket.broadcast.emit(type_message, data1, data2) = envoie à tous les clients
//		sauf au client connecté
//io.sockets.emit(type_message, data1, data2) = envoie à tous les clients y compris
//		au client connecté.
//	Variantes avec les "room" :
//	socket.broadcast.to(nom de la salle).emit(...) = tous sauf client courant, mais
//													 de la salle
//io.sockets.in(nom de la salle).emit(...) = tous les clients de la salle y compris
//											  le client courant.

io.sockets.on('connection', function (socket){

	// Permet d'envoyer des traces au client distant
	function log(){
		var array = [">>> "];
	  for (var i = 0; i < arguments.length; i++) {
	  	array.push(arguments[i]);
	  }
	    socket.emit('log', array);
	}

	socket.on('message', function (message) {
		log('Got message: ', message);
		socket.broadcast.emit('message', message); // should be room only
	});

	socket.on('create or join', function (room) {
		var numClients = io.sockets.clients(room).length;

		log('Room ' + room + ' has ' + numClients + ' client(s)');
		log('Request to create or join room', room);

		if (numClients == 0){
			socket.join(room);
			socket.emit('created', room);
		} else if (numClients == 1) {
			io.sockets.in(room).emit('join', room);
			socket.join(room);
			socket.emit('joined', room);
		} else { // max two clients
			socket.emit('full', room);
		}
		//socket.emit('emit(): client ' + socket.id + ' joined room ' + room);
		//socket.broadcast.emit('broadcast(): client ' + socket.id + ' joined room ' + room);

	});

});
