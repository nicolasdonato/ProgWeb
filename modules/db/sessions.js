
//Imports and constants
/////////////////////////////////////////////////////////////////////////////////////


var mod_db = require('./manager');
var mod_db_users = require('./users'); 
var mod_utils = require('../utils'); 
var logger = require('../logger'); 

var DbName = 'sessions'; 


//Objects
/////////////////////////////////////////////////////////////////////////////////////


//Template of document 'Session' in database

function Session(login, token, begin) {

	// Mandatory information
	this.login = login; 
	this.token = token; 

	if (begin == null) {
		this.begin = new Date(); 
	} else {
		this.begin = begin;
	}
}

module.exports.Session = Session; 


function SessionInfo(token, user, error) {

	this.token = token; 
	this.user = user; 
	
	if (error == null) {
		this.error = ''; 
	} else {
		this.error = error; 
	}

	this.isActive = function() {
		return this.token != ''; 
	}
	
	this.hasError = function() {
		return this.error != ''; 
	}

	this.getError = function() {
		return this.error; 
	}
}


//External API
/////////////////////////////////////////////////////////////////////////////////////


module.exports.requestLogin = function(req, res) {

	if (req.body.token != undefined) {
		module.exports.authenticate(req.body.token, function(result) {
			res.send(result);
		}); 
	}

	else if (req.body.login != undefined) {
		module.exports.login(req.body.login, req.body.password, function(result) {
			res.send(result);
		}); 
	}
	
	else {
		res.send(new SessionInfo('', null, 'No login/session specified')); 
	}
};


module.exports.requestLogout = function(req, res) {

	module.exports.logout(req.body.token, function(result) {

		res.send(result); 
	});
}


module.exports.join = function(req, res) {
	// TODO
}; 


module.exports.leave = function(req, res) {
	// TODO
}; 


//Local API
/////////////////////////////////////////////////////////////////////////////////////


module.exports.getCollectionName = function() {
	return DbName; 
}; 


module.exports.login = function(login, password, callback) {

	mod_db_users.authenticate(login, password, function(user) {

		var actionResult; 
		if (user.login == '') {

			logger.out("Failed login <" + login + ";" + password + ">"); 
			info = new SessionInfo('', null); 

		} else {

			logger.out("Successfull login <" + login + ";" + password + ">"); 
			var token = mod_utils.getStampedHash(user.login); 
			var session = new Session(user.login, token); 

			mod_db.connect(function(db) {
				db.collection(DbName).insert(session); 
			}); 

			info = new SessionInfo(token, user); 
		}

		callback(info);
	}); 
}; 


module.exports.logout = function(token, callback) {

	// Authentication to be allowed to logout
	module.exports.authenticate(token, function(info) {

		if (! info.isActive()) {
			callback(info); 
			return; 
		} 

		// Authentication succeeded
		mod_db.connect(function(db) {

			// Find session
			var query = { "token":token }; 
			var cursor = db.collection(DbName).find(query); 
			cursor.toArray(function(err, result) {

				if (err) {
					logger.err('Removal of session with token <' + token + '> failed: ' + err);
					info.error = 'Failed to logout'; 
				} else if (result.length == 0) {
					logger.out('No session with token <' + token + '> found for removal'); 
					info.error = 'No session found';
				} else if (result.length > 1) {
					throw new Exception('More than one session with token <' + token + '> found');
				} else {
					logger.out('User <' + result[0].login + '> logging out'); 
					db.collection(DbName).remove(query);
					info = new SessionInfo('', result[0].login);
				}

				callback(info); 
			}); 
		}); 
	}); 
}


module.exports.authenticate = function(token, callback) {

	mod_db.connect(function(db) {

		var query = { 'token':token };
		var cursor = db.collection(DbName).find(query); 

		cursor.toArray(function(err, result) {

			if (err) {
				logger.err('Authentification with token <' + token + '> failed: ' + err);
				callback(new SessionInfo('', null, 'Authentification process failed')); 
				return;
			} else if (result.length == 0) {
				logger.out('Authentification with token <' + token + '> failed')
				callback(new SessionInfo('', null, 'Unknown session')); 
				return;
			} else if (result.length > 1) {
				throw new Exception('More than one user with the same token were found');
			}

			var session = result[0];
			mod_db_users.getUser(session.login, function(user) {
				callback(new SessionInfo(token, user)); 
			}); 
		});
	});
};


//Useful functions
/////////////////////////////////////////////////////////////////////////////////////


