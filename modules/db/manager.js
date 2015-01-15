
var mod_db_connect = require('./connection');


var damien = { name : 'damien', password : 'lepiller'};
var nicolas = { name : 'nicolas', password : 'donato'};
var romain = { name : 'romain', password : 'trucchi'};

var initializationUsers = [damien, nicolas, romain];


module.exports.initialize = function() {
	
	mod_db_connect.connect(function(db) {
		
		var collection = db.collection('user');

		// Réinitialiser la collection
		collection.remove();

		// Ajout des utilisateurs prédéfinis
		for(var index in initializationUsers){
			collection.insert({
				name : initializationUsers[index].name,
				password : initializationUsers[index].password
			});
		}
	});
};

/*
	//Création d'un modèle avec mo
	var User = mongoose.model('User', UserSchema);
	// Déclaration d’une entité utilisateur
		var user = new User({
			'firstName' : 'Thomas',
			'name' : 'Castelly'
		});
		// Persistance de l'utilisateur
		User.create(user, function(err, _user){
			// Utilisateur ajouté
		})*/


module.exports.list = function(callBack) {
	
	mod_db_connect.connect(function(db) {
		var cursor = db.collection('user').find();
		cursor.toArray(callBack);
	});
};

module.exports.findByNameAndPassword = function(userName, userPassword, callBack) {
	
	mod_db_connect.connect(function(db) {
		
		var cursor = db.collection('user').find({ name : userName,  password : userPassword});

		cursor.toArray(function(err, data) {
			callBack(data.length > 0);
		});
	});
};
