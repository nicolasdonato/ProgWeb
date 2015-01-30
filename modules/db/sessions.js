
//Imports and constants
/////////////////////////////////////////////////////////////////////////////////////


var node_future = require('fibers/future');

var mod_db = require('./manager');
var mod_db_users = require('./users'); 
var mod_utils = require('../utils'); 
var logger = require('../logger'); 


var wait = node_future.wait; 

var DbName = 'sessions'; 


//Objects
/////////////////////////////////////////////////////////////////////////////////////


//Template of document 'Session' in database
function Session(token, user, begin) {

	// Mandatory information
	this.token = token; 
	this.user = user; 

	if (begin == undefined || begin == null) {
		this.begin = new Date(); 
	} else {
		this.begin = begin;
	}
}


function SessionInfo(success, message, data) {

	mod_db.ServerInfo.call(this, success, message, data);

	this.update = function(callback) {

		if (this.result == undefined || this.result == null) {
			callback(this); 
		} else if (this.result instanceof Array) {
			// TODO
			callback(this); 
		} else {

			dbToSession(this, this.result, function(that, session) {
				that.result = session; 
				callback(that); 
			}); 
		}
	}
}

SessionInfo.prototype = mod_db.ServerInfo; 

var makeSessionInfo = function(success, message, data, callback) {

	var sessionInfo = new SessionInfo(success, message, data); 
	sessionInfo.update(callback); 
}


//External API
/////////////////////////////////////////////////////////////////////////////////////


module.exports.requestLogin = function(req, res) {

	if (req.body.token != undefined) {
		module.exports.authenticate(req.body.token, function(sessionInfo) {
			res.send(sessionInfo);
		}); 
	}

	else if (req.body.login != undefined) {
		module.exports.login(req.body.login, req.body.password, function(sessionInfo) {
			res.send(sessionInfo);
		}); 
	}

	else {
		res.send(new SessionInfo(false, 'No login/session specified')); 
	}
};


module.exports.requestLogout = function(req, res) {

	module.exports.logout(req.body.token, function(result) {

		res.send(result); 
	});
}


module.exports.requestJoin = function(req, res) {
	// TODO
}; 


module.exports.requestLeave = function(req, res) {
	// TODO
}; 


//Local API
/////////////////////////////////////////////////////////////////////////////////////


module.exports.getCollectionName = function() {
	return DbName; 
}; 


module.exports.login = function(login, password, callback) {

	mod_db_users.authenticate(login, password, function(userInfo) {

		if (! userInfo.success) {
			callback(new SessionInfo(false, 'Failed to login with <' + login + ';' + password + '> :' + userInfo.message)); 
			return; 
		} 

		logger.out("Successfull login <" + login + ";" + password + ">"); 
		var token = mod_utils.getStampedHash(userInfo.result.login); 
		var session = new Session(token, userInfo.result.login); 

		mod_db.connect(function(db) {
			db.collection(DbName).insert(session); 
		}); 

		makeSessionInfo(true, '', session, callback); 
	}); 
}; 


module.exports.logout = function(token, callback) {

	// Authentication to be allowed to logout
	module.exports.authenticate(token, function(sessionInfo) {

		if (! sessionInfo.success) {
			callback(new SessionInfo(false, 'Failed to logout: ' + sessionInfo.message)); 
			return; 
		} 

		var query = { token: token }; 
		mod_db.find(DbName, query, function(result) {

			if (result.length == 0) {
				logger.out('No session with token <' + token + '> found for removal'); 
				callback(new SessionInfo(false, 'Failed to logout: no session found'));
			} else if (result.length > 1) {
				throw new Error('More than one session with token <' + token + '> found');
			} else {

				db.collection(DbName).remove(query);
				logger.out('User <' + result[0].user.login + '> logging out'); 

				makeSessionInfo(true, '', result[0], callback); 
			}
		}); 
	}); 
}


module.exports.authenticate = function(token, callback) {

	mod_db.find(DbName, { token: token }, function(result) {

		if (result.length == 0) {
			logger.out('Authentification with token <' + token + '> failed')
			callback(new SessionInfo(false, 'Unknown session')); 
			return;
		} else if (result.length > 1) {
			throw new Error('More than one user with the same token were found');
		}

		makeSessionInfo(true, '', result[0], callback); 
	});
};


//Useful functions
/////////////////////////////////////////////////////////////////////////////////////


var dbToSession = function(that, s, callback) {

	mod_db_users.getUser(s.user, function(userInfo) {

		if (userInfo == null) {
			throw new Error('User info is null'); 
		} else if (! userInfo.success) {
			throw new Error('There should be a user <' + s.login + '> in DB'); 
		}

		var session = new Session(s.token, userInfo.result, s.begin);
		callback(that, session); 
	}); 
}


