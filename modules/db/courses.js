
var mod_db = require('./manager');
var mod_utils = require('../utils'); 


var DbName = 'courses'; 


/*
 * Template of document 'Course' in database. 
 */
Course = function(name, description) {
	
	// Mandatory information
	this.name = name; 
	this.description = description; 
	
}

module.exports.Course = Course; 


module.exports.getCollectionName = function() {
	return DbName; 
}


module.exports.initialize = function(db) {

	var collection = db.collection(module.exports.getCollectionName());
	
	// Définir les utilisateurs de base
	var web_srv = new Course('web_srv', 'Programmation Web côté Serveur'); 
	var web_cli = new Course('web_cli', 'Programmation Web côté Client'); 
	var web_sem = new Course('web_sem', 'Web Sémantique'); 

	var initializationData = [web_srv, web_cli, web_sem];

	// Ajout des utilisateurs prédéfinis
	for (var index in initializationData) {
		collection.insert(initializationData[index]); 
	}
}


module.exports.create = function(req, res) {

	var data = { name : req.body.name, description : req.body.description };

	mod_db.connect(function(db) {
		var course = new Course(data.name, data.description); 
		var query = { name : course.name }; 
		var cursor = db.collection(DbName).find(query);
		cursor.toArray(function(err, data){
			var result = { name : course.name, newlyCreated : false }
			if (data.length == 0) {
				db.collection(DbName).insert(course);
				result.newlyCreated = true;
			}
			res.send(result); 
		});
	});
}


module.exports.list = function(req, res) {
	//
	//TODO mettre en place le token dans les données envoyées pour authentifier la requete
	//
	mod_db.connect(function(db) {
		var cursor = db.collection(DbName).find();
		cursor.toArray(function(err, data){
//			for(var i in data){
//				delete data[i].password; 
//			}
			res.send(data); 
		});
	});
}


module.exports.get = function(req, res) {
	// TODO
}


module.exports.update = function(req, res) {
	// TODO
}


module.exports.remove = function(req, res) {
	// TODO			
}


