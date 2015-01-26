
var mod_db = require('./manager');
var mod_db_users = require('./users');
var mod_utils = require('../utils'); 


var DbName = 'sessions'; 


/*
 * Template of document 'Session' in database. 
 */
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


module.exports.getCollectionName = function() {
	return DbName; 
}; 


module.exports.login = function(login, password, callback) {

	mod_db_users.authenticate(login, password, function(user) {
		var result = { authenticated: false, token: '' }; 

		if (user.login == '') {
			result = { authenticated: false, token: ''}; 
		} else {

			var token = mod_utils.getStampedHash(user.login); 
			var session = new Session(user.login, token); 
			
			mod_db.connect(function(db) {
				db.collection(DbName).insert(session); 
			}); 

			result = { authenticated: true, token: token }; 
		}

		callback(result);
	}); 
}; 


module.exports.requestLogin = function(req, res) {

	module.exports.login(req.body.login, req.body.password, function(result) {
		res.send(JSON.stringify(result));
	}); 
};

/*
var authenticate = function(data, res){
	
	mod_db_sessions.login(data.login, data.password, function (result) {
		
	});
};


var authenticate_post = function(req, res){

	var data = {login : req.body.login, password : req.body.password };
	
	authenticate(data, res);
};*/


module.exports.join = function(req, res) {
	// TODO
}; 


module.exports.leave = function(req, res) {
	// TODO
}; 


