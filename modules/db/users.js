
var mod_db = require('./manager');
var mod_utils = require('../utils'); 
var logger = require('../logger'); 


var DbName = 'users'; 


/*
 * Template of document 'User' in database. 
 */
User = function(login, password) {
	
	// Mandatory information
	this.login = login; 
	this.password = password; 
	this.role = Roles.STUDENT; 
	
	// Optional information
	this.firstname = ''; 
	this.lastname = ''; 
	this.organization = ''; 
	this.country = ''; 
	
	this.cleanCopy = function(user) {
		this.role = user.role; 
		this.firstname = user.firstname; 
		this.lastname = user.lastname; 
		this.organization = user.organization; 
		this.country = user.country; 
		this.courses = user.courses; 
	}
}

module.exports.User = User; 


Roles = {
	STUDENT: 1, 
	TEACHER: 2, 
	ADMIN: 3
}; 

module.exports.Roles = Roles; 


module.exports.getCollectionName = function() {
	return DbName; 
}


module.exports.initialize = function(db) {

	var collection = db.collection(module.exports.getCollectionName());
	
	// Définir les utilisateurs de base
	var damien = new User('damien', 'lepiller'); 
	var nicolas = new User('nicolas', 'donato'); 
	var romain = new User('romain', 'truchi'); 
	var initializationData = [damien, nicolas, romain];

	// Ajout des utilisateurs prédéfinis
	for (var index in initializationData) {
		var hash = mod_utils.getHash(initializationData[index].password); 
		initializationData[index].password = hash; 
		collection.insert(initializationData[index]); 
	}
}


module.exports.authenticate = function(login, password, callBack) {
	
	mod_db.connect(function(db) {

		var hash = mod_utils.getHash(password); 
		var query = { login : login,  password : hash}; 
		var cursor = db.collection(DbName).find(query); 
		
		cursor.toArray(function(err, result) {
			
			if (err) {
				logger.err(err);
				callBack(new User('', '')); 
				return;
			}

			if (result.length == 0) {
				callBack(new User('', '')); 
				return;
			}

			if (result.length > 1) {
				throw new Exception("More than one user with the same login/password were found");
			}
			
			var user = result[0];
			
			var cleanUser = new User(user.login, ''); 
			cleanUser.cleanCopy(user); 
			callBack(cleanUser); 
		});
	});
}


module.exports.create = function(req, res) {
	
	
}


module.exports.listUsers = function(callBack) {

	mod_db.connect(function(db) {
		
		var cursor = db.collection(DbName).find();
		
		cursor.toArray(function(err, data){
			for(var i in data){
				delete data[i].password; 
			}
			callBack(err, data);
		});
		
		
	});
}


module.exports.list = function(req, res) {
	module.exports.listUsers(function(err, data){
		res.send(JSON.stringify(data)); 
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

