
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


//External API
/////////////////////////////////////////////////////////////////////////////////////


module.exports.requestLogin = function(req, res) {

	module.exports.login(req.body.login, req.body.password, function(result) {

		res.send(JSON.stringify(result));
	}); 
};


module.exports.requestLogout = function(req, res) {

	module.exports.logout(req.body.token, function(result) {

		res.send(JSON.stringify(result)); 
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
			actionResult = { authenticated: false, token: ''}; 

		} else {

			logger.out("Successfull login <" + login + ";" + password + ">"); 
			var token = mod_utils.getStampedHash(user.login); 
			var session = new Session(user.login, token); 

			mod_db.connect(function(db) {
				db.collection(DbName).insert(session); 
			}); 

			actionResult = { authenticated: true, token: token }; 
		}

		callback(actionResult);
	}); 
}; 


module.exports.logout = function(token, callback) {

	// Authentication to be allowed to logout
	module.exports.authenticate(token, function(user) {

		var actionResult = { logout: false}; 

		if (user.login == '') {

			// Authentication failed
			callback(actionResult); 

		} else {

			// Authentification succeeded
			mod_db.connect(function(db) {

				// Find session
				var query = { "token":token }; 
				var cursor = db.collection(DbName).find(query); 
				cursor.toArray(function(err, result) {

					if (err) {
						logger.err('Removal of session with token <' + token + '> failed: ' + err);
					} else if (result.length == 0) {
						logger.out('No session with token <' + token + '> found for removal'); 
					} else if (result.length > 1) {
						throw new Exception('More than one session with token <' + token + '> found');
					} else {

						logger.out('User <' + result[0].login + '> logging out'); 
						db.collection(DbName).remove(query);
						actionResult.logout = true ; 
					}

					callback(actionResult); 
				}); 
			}); 
		}
	}); 
}


module.exports.authenticate = function(token, callback) {

	mod_db.connect(function(db) {

		var query = { 'token':token };
		var cursor = db.collection(DbName).find(query); 

		cursor.toArray(function(err, result) {

			if (err) {
				logger.err('Authentification with token <' + token + '> failed: ' + err);
				callBack(new User('', '')); 
				return;
			} else if (result.length == 0) {
				logger.out('')
				callBack(new User('', '')); 
				return;
			} else if (result.length > 1) {
				throw new Exception('More than one user with the same token were found');
			}

			var session = result[0];
			mod_db_users.getUser(session.login, function(user) {
				callback(user); 
			}); 
		});
	});
};


//Useful functions
/////////////////////////////////////////////////////////////////////////////////////


