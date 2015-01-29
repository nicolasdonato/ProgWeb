
//Imports and constants
/////////////////////////////////////////////////////////////////////////////////////


var mod_db = require('./manager');
var mod_utils = require('../utils'); 
var logger = require('../logger'); 

var DbName = 'users'; 


//Objects
/////////////////////////////////////////////////////////////////////////////////////


//Template of document 'User' in database

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

	this.clean = function() {
		user = new User(this.login, ''); 
		user.role = this.role; 
		user.firstname = this.firstname; 
		user.lastname = this.lastname; 
		user.organization = this.organization; 
		user.country = this.country; 
		user.courses = this.courses; 
	}
}

module.exports.User = User; 


//Role level for users

Roles = {
		STUDENT: 1, 
		TEACHER: 2, 
		ADMIN: 3
}; 

module.exports.Roles = Roles; 


//External API
/////////////////////////////////////////////////////////////////////////////////////


module.exports.create = function(req, res) {


}


module.exports.list = function(req, res) {
	module.exports.listUsers(function(err, data){
		res.send(data); 
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


//Local API
/////////////////////////////////////////////////////////////////////////////////////


module.exports.getCollectionName = function() {
	return DbName; 
}


module.exports.initialize = function(db) {

	var collection = db.collection(module.exports.getCollectionName());

	// Définir les utilisateurs de base
	var admin = new User('admin', 'root'); 
	admin.role = Roles.ADMIN; 
	var damien = new User('damien', 'lepiller'); 
	damien.role = Roles.STUDENT; 
	var nicolas = new User('nicolas', 'donato'); 
	nicolas.role = Roles.STUDENT; 
	var romain = new User('romain', 'truchi'); 
	romain.role = Roles.STUDENT; 
	var sander = new User('peter', 'sander'); 
	sander.role = Roles.TEACHER; 
	var buffa = new User('michel', 'buffa'); 
	buffa.role = Roles.TEACHER; 
	var initializationData = [admin, damien, nicolas, romain, sander, buffa];

	// Ajout des utilisateurs prédéfinis
	for (var index in initializationData) {
		var hash = mod_utils.getHash(initializationData[index].password); 
		initializationData[index].password = hash; 
		collection.insert(initializationData[index]); 
	}
}


module.exports.authenticate = function(login, password, callback) {

	mod_db.connect(function(db) {

		var hash = mod_utils.getHash(password); 
		var query = { login : login,  password : hash}; 
		var cursor = db.collection(DbName).find(query); 

		cursor.toArray(function(err, result) {

			if (err) {
				logger.err(err);
				callback(new User('', '')); 
				return;
			} else if (result.length == 0) {
				callback(new User('', '')); 
				return;
			} else if (result.length > 1) {
				throw new Exception("More than one user with the same login/password were found");
			}

			callback(dbToUser(result[0])); 
		});
	});
}


module.exports.listUsers = function(callback) {

	mod_db.connect(function(db) {

		var cursor = db.collection(DbName).find();
		cursor.toArray(function(err, users) {
			
			for (var i in users){
				users[i] = dbToUser(users[i]);  
			}
			
			callback(err, users);
		});
	});
}


module.exports.getUser = function(login, callback) {

	mod_db.connect(function(db) {

		var query = { "login":login }; 
		var cursor = db.collection(DbName).find(query);

		cursor.toArray(function(err, result) {

			if (err) {
				logger.err(err);
				callback(new User('', '')); 
				return;
			} else if (result.length == 0) {
				callback(new User('', '')); 
				return;
			} else if (result.length > 1) {
				throw new Exception("More than one user with the same login were found");
			}

			callback(dbToUser(result[0])); 
		});
	}); 
}


//Useful functions
/////////////////////////////////////////////////////////////////////////////////////


function dbToUser(u) {
	
	var user = new User(u.login, ''); 
	user.role = u.role; 
	user.firstname = u.firstname; 
	user.lastname = u.lastname; 
	user.organization = u.organization; 
	user.country = u.country; 
	user.courses = u.courses; 

	return user; 
}


