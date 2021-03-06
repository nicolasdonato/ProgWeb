
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


module.exports.CheckSessionInfo = function(req, res, next) {

	if (!req.sessionInfo.user == undefined || req.sessionInfo.token == undefined) {
		logger.err('User <' + req.sessionInfo.user + '> is undefined or token <' + req.sessionInfo.token + '> is undefined');
		res.send(new RepositoryFileInfo(false, 'Unknown session'));
	} else{
		next(req, res);
	}
};

module.exports.requestLogin = function(req, res) {

	if (req.body.token != undefined) {
		if (mod_db.checkParams(req, res, ['token'])) {
			module.exports.authenticate(req.body.token, function(sessionInfo) {
				res.send(sessionInfo);
			}); 
		}
	}

	else if (req.body.login != undefined) {
		if (mod_db.checkParams(req, res, ['login', 'password'])) {
			module.exports.login(req.body.login, req.body.password, function(sessionInfo) {
				if (sessionInfo.success) {
					logger.out('User <' + sessionInfo.result.user.login + '> is authenticated by the login/password');
				}
				res.send(sessionInfo);
			}); 
		}
	}

	else {
		res.send(new SessionInfo(false, 'No login/session specified')); 
	}
};


module.exports.requestLogout = function(req, res) {

	if (mod_db.checkParams(req, res, ['token'])) {
		module.exports.logout(req.body.token, function(result) {
			if (result.success) {
				logger.out('User <'+ result.result.user.login + '> has logged out');
			}
			res.send(result); 
		});
	}
}


// Méthode utilisée exclusivement par le handler de paramètre nommé :token défini dans config/routes
module.exports.requestTokenValidation = function (req, res, next, token) {

	if (token.length == 0 || token == "undefined") {
		next(new SessionInfo(false, 'No session'));
	} else {

		module.exports.authenticate(token, function(sessionInfo) {

			if (! sessionInfo.success) {
				next(new SessionInfo(false, 'Unknown session'));
			} else{

				// on passe result dans la variable sessionInfo (ne pas affecter req.session car c'est un autre magasin de stockage)
				// enfin on pourrait plutot stocker ça comme ça aussi req.session.sessionInfo = result
				// mais req.session.sessionInfo survit entre les requetes car il est identifié par un cookie
				// c'est pas ce qu'on veut ici : c'est juste pour la chaine des traitements request -> ... -> response
				req.sessionInfo = sessionInfo.result;
				next();
			}
		}); 
	}
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

	module.exports.authenticate(token, function(sessionInfo) {

		if (! sessionInfo.success) {
			callback(new SessionInfo(false, 'Failed to logout: ' + sessionInfo.message)); 
			return; 
		} 

		var query = { token: token }; 
		mod_db.remove(DbName, query, function(result) {

			if (result.length == 0) {
				logger.out('No session with token <' + token + '> found for removal'); 
				callback(new SessionInfo(false, 'Failed to logout: no session found'));
			} else if (result.length > 1) {
				throw new Error('More than one session with token <' + token + '> found');
			} else {
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

	if (typeof s.user == 'string') {

		mod_db_users.get(s.user, function(userInfo) {

			if (userInfo == null) {
				throw new Error('User info is null'); 
			} else if (! userInfo.success) {
				throw new Error('There should be a user <' + s.user + '> in DB'); 
			}

			var session = new Session(s.token, userInfo.result, s.begin);
			callback(that, session); 
		}); 

	} else {
		var session = new Session(s.token, s.user, s.begin);
		callback(that, s); 
	}
}


