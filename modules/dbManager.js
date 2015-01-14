//var mongoose = require('mongoose');
//var UserSchema = require('user');
var mongodb = require('mongodb');
var mongoDbUrl = "";
var damien = { name : 'damien', password : 'lepiller'};
var damien2 = { name : 'damie2n', password : 'lepiller'};
var initializationUsers = [damien, damien2];


module.exports.initialize = function(dbName){
	mongoDbUrl = "mongodb://localhost:27017/" + dbName;

	//Connexion à la database
	mongodb.MongoClient.connect(mongoDbUrl, function(err, db) {
		var collection = db.collection('user');
		//
		//Réinitialiser la collection
		//
		collection.remove();
		//
		//Ajout des utilisateurs prédéfinis
		//
		for(var index in initializationUsers){
			collection.insert({
				name : initializationUsers[index].name,
				password : initializationUsers[index].password
			});
		}
		
	});
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
};


module.exports.list = function(callBack){
	mongodb.MongoClient.connect(mongoDbUrl, function(err, db) {
		var cursor = db.collection('user').find();
		//cursor.each();
		/*cursor.toArray(function(err, results){
		    console.log(results); // output all records
		});*/
		cursor.toArray(callBack);
	});
};

module.exports.findByNameAndPassword = function(userName, userPassword, callBack){
	mongodb.MongoClient.connect(mongoDbUrl, function(err, db) {
		var cursor = db.collection('user').find({ name : userName,  password : userPassword});
		//cursor.each();
		/*cursor.toArray(function(err, results){
		    console.log(results); // output all records
		});*/
		cursor.toArray(function(err, data){
			callBack(data.length > 0);
		});
		
	});
};
