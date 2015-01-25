
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
	this.role = 1; 
	
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


module.exports.getCollectionName = function() {
	return DbName; 
}


module.exports.authenticate = function(login, password, callBack) {
	
	mod_db.connect(function(db) {

		var hash = mod_utils.getHash(password); 
		var query = { login : login,  password : hash}; 
		var cursor = db.collection(DbName).find(query); 
		
		cursor.toArray(function(err, result) {
			
			if(err){
				logger.err(err);
				callBack(new User('', '')); 
				return;
			}

			if(result.length == 0){
				callBack(new User('', '')); 
				return;
			}

			if(result.length > 1){
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
	// TODO
}


module.exports.list = function(req, res) {

	mod_db.connect(function(db) {
		
		var cursor = db.collection(DbName).find();
		
		var users = []; 
		cursor.toArray(function(user) {
			delete user.password; 
			users.push(user); 
		});
		
		res.send(JSON.stringify(users)); 
	});
};


module.exports.get = function(req, res) {
	// TODO
}


module.exports.update = function(req, res) {
	// TODO
}


module.exports.remove = function(req, res) {
	// TODO
}

