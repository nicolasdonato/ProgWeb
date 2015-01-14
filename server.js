var portNumber = 8888;

var static = require('node-static');
var http = require('http');
var file = new(static.Server)();
var app = http.createServer(function (req, res) {

  console.log("Incoming request: (" + req.method + ") " + req.url);
  
  file.serve(req, res);
  
}).listen(portNumber);


//
var dbManager = require('./modules/dbManager.js');

var dbName = "GEOCHAT";

dbManager.initialize(dbName);

// var express = require('express');
// var app = express();
// console.log(express.static(__dirname + '/js'));
// app.use(express.static(__dirname + '/js'));
// app.all('*', function(req, res){
// 	res.sendfile("index.html");
// });

// app.listen(9000);

// M.Buffa. Rappel des trois syntaxes de socket.io
// socket = un tuyau relié à un client. C'est un objet unique par client.
//      Donc si on fait socket.n = 3; c'est comme si on ajoutait une propriété
// 		"n" à la session dédiée au client connecté. 
// socket.emit(type_message, data) = envoie un message juste au client connecté
// socket.broadcast.emit(type_message, data1, data2) = envoie à tous les clients
// 		sauf au client connecté
// io.sockets.emit(type_message, data1, data2) = envoie à tous les clients y compris
// 		au client connecté.
// 	Variantes avec les "room" :
// 	socket.broadcast.to(nom de la salle).emit(...) = tous sauf client courant, mais
// 													 de la salle
// io.sockets.in(nom de la salle).emit(...) = tous les clients de la salle y compris
// 											  le client courant.

var io = require('socket.io').listen(app);
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


io.
of('/connect').
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