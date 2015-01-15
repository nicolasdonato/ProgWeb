
var node_hash = require('es-hash'); 

var mod_db_connect = require('./connection');
var mod_utils = require('../utils'); 


var DbName = 'user'; 


module.exports.login = function(userName, userPassword, callBack) {
	
	mod_db_connect.connect(function(db) {
		
		var hash = node_hash(userPassword, 'sha256'); 
		var query = { name : userName,  password : hash}; 
		
		var cursor = db.collection(DbName).find(query); 
		cursor.toArray(function(err, data) {
			
			var token = node_hash({ name : userName, stamp: mod_utils.getTimeStamp() }, 'sha256'); 
			
			data['token'] = token; 
			db.collection(DbName).update(query, data); 
			
			callBack(data.length, token);
		});
	});
};


module.exports.list = function(callBack) {
	
	mod_db_connect.connect(function(db) {
		var cursor = db.collection(DbName).find();
		cursor.toArray(callBack);
	});
};

