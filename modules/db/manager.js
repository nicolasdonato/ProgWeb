
var node_hash = require('es-hash'); 

var mod_db_connect = require('./connection');


var damien = { name : 'damien', password : 'lepiller'};
var nicolas = { name : 'nicolas', password : 'donato'};
var romain = { name : 'romain', password : 'trucchi'};

var initializationUsers = [damien, nicolas, romain];


module.exports.initialize = function () {
	
	mod_db_connect.connect(function (db) {
		
		var collection = db.collection('user');

		// Réinitialiser la collection
		collection.remove();

		// Ajout des utilisateurs prédéfinis
		for (var index in initializationUsers) {
			var hash = node_hash(initializationUsers[index].password, 'sha256'); 
			collection.insert({ name: initializationUsers[index].name, password: hash }); 
		}
	});
};


