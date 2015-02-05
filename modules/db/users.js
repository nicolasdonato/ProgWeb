
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
}


function UserInfo(success, message, data) {

	var user = null; 
	if (data != undefined && data != null) {

		if (data instanceof Array) {

			user = []; 
			for (var i = 0; i < data.length; i++) {

				var item = data[i]; 
				if (item != undefined && item != null) {
					user.push(dbToUser(item)); 
				}
			}

		} else {
			user = dbToUser(data); 
		}
	}

	mod_db.ServerInfo.call(this, success, message, user); 
}

UserInfo.prototype = mod_db.ServerInfo; 


//Role level for users
Roles = {
		STUDENT: 1, 
		TEACHER: 2, 
		ADMIN: 3
}; 

module.exports.Roles = Roles; 


//External API
/////////////////////////////////////////////////////////////////////////////////////


module.exports.requestCreate = function(req, res) {
	// TODO
}


module.exports.requestList = function(req, res) {

	if (mod_db.checkParams(req, res, ['token'])) {

		mod_db_sessions.authenticate(req.param('token'), function(sessionInfo) {

			if (! sessionInfo.success) {
				callback(new CourseInfo(false, 'Failed to list the users: ' + sessionInfo.message)); 
				return;
			}

			module.exports.list(function(err, userInfos){
				res.send(userInfos); 
			});
		});
	}
}


module.exports.requestGet = function(req, res) {
	// TODO
}



module.exports.requestUpdate = function(req, res) {
	// TODO
}



module.exports.requestRemove = function(req, res) {
	// TODO
}


//Local API
/////////////////////////////////////////////////////////////////////////////////////


module.exports.getCollectionName = function() {
	return DbName; 
}


module.exports.initialize = function(db) {

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

	var collection = db.collection(DbName);
	for (var index in initializationData) {
		var hash = mod_utils.getHash(initializationData[index].password); 
		initializationData[index].password = hash; 
		collection.insert(initializationData[index]); 
	}
}


module.exports.authenticate = function(login, password, callback) {

	var hash = mod_utils.getHash(password); 
	mod_db.find(DbName, { login: login,  password: hash }, function(result) {

		if (result.length == 0) {
			callback(new UserInfo(false, 'The user <' + login + '> is unknown')); 
			return;
		} else if (result.length > 1) {
			throw new Error("More than one user with the same login/password were found");
		}

		callback(new UserInfo(true, '', result[0])); 
	});
}


module.exports.list = function(callback) {

	mod_db.find(DbName, { }, function(result) {

		callback(new UserInfo(true, '', result)); 
	});
}


module.exports.get = function(login, callback) {

	mod_db.find(DbName, { login: login }, function(result) {

		if (result.length == 0) {
			callback(new UserInfo(false, 'The user <' + login + '> is unknown')); 
			return;
		} else if (result.length > 1) {
			throw new Error("More than one user with the same login were found");
		} else if (result[0] == null) {
			callback(new UserInfo(false, 'Return item null')); 
			return;
		}

		callback(new UserInfo(true, '', result[0])); 
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


