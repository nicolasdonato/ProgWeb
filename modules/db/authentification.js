
var node_hash = require('es-hash'); 

var mod_db = require('./manager');
var mod_utils = require('../utils'); 


var DbName = 'user'; 


module.exports.login = function(userName, userPassword, callBack) {
	
	mod_db.connect(function(db) {
		
		var hash = node_hash(userPassword, 'sha256'); 
		var query = { name : userName,  password : hash}; 
		
		var cursor = db.collection(DbName).find(query); 
		cursor.toArray(function(err, data) {
			
			var token = node_hash({ name : userName, stamp: mod_utils.getTimeStamp() }, 'sha256'); 
			
			var validUser = data.length > 0;
			
			if(validUser){
				data[0].token = token; 
				db.collection(DbName).update(query, data[0]); 
			}
			
			callBack(validUser, {
				userName: userName,
				token: validUser ? token : ''
			});
		});
	});
};


module.exports.list = function(callBack) {
	
	mod_db.connect(function(db) {
		var cursor = db.collection(DbName).find();
		cursor.toArray(callBack);
	});
};

