
//Imports and constants
/////////////////////////////////////////////////////////////////////////////////////

var node_mongodb = require('mongodb');

var mod_db_classes = require('./classes');
var mod_db_courses = require('./courses');
var mod_db_sessions = require('./sessions');
var mod_db_users = require('./users');
var mod_utils = require('../utils'); 

var logger = require('../logger'); 


var mongo = node_mongodb.MongoClient;

var mongoDbUrlBase = "mongodb://localhost:27017/";
var url = "";

var db = null;
var cleanDb = true;


//Objects
/////////////////////////////////////////////////////////////////////////////////////


ServerInfo = function(success, message, result) {

	this.success = success; 
	this.message = message; 
	this.result = result; 
}

module.exports.ServerInfo = ServerInfo; 


//External API
/////////////////////////////////////////////////////////////////////////////////////


module.exports.checkParams = function(req, res, paramList) {
	
	for (var i = 0; i < paramList.length; i++) {
		if (req.param(paramList[i]) == null) {
			
			var serverInfo = new ServerInfo(false, 'Property <' + paramList[i] + '> is missing'); 
			res.send(serverInfo); 
			return false; 
		}
	}
	
	return true; 
}; 


//Local API
/////////////////////////////////////////////////////////////////////////////////////


module.exports.connect = function(cb) {

	if (db) {
		cb(db);
		return;
	}

	mongo.connect(url, function(err, conn) {
		console.log("Connection to DB at url <" + url +">");

		if (url == "" || !conn) {
			throw new Error("DB connection error");
		} else if (err) {
			throw new Error("Error on connection: " + err.message);
		} else {
			db = conn;
			cb(db);
		}
	});
};


module.exports.initialize = function(databaseName) {

	url = mongoDbUrlBase + databaseName;

	module.exports.connect(function(db) {

		if (cleanDb) {

			clear(db);

			mod_db_users.initialize(db);
			mod_db_courses.initialize(db);
			mod_db_classes.initialize(db);
		}
	});
};


module.exports.insert = function(collection, document) {

	module.exports.connect(function(db) {
		try {

			db.collection(collection).insert(document, function(err, result) {
				if (err) {
					throw new Error('Error caught on insert request : ' + e.name + ': ' + e.message);
				}
			});

		} catch(e) {
			throw new Error('Error caught on insert request : ' + e.name + ': ' + e.message); 
		}
	}); 
}


module.exports.find = function(collection, query, callback) {

	module.exports.connect(function(db) {
		try {

			var cursor = db.collection(collection).find(query);
			if (cursor == null) {
				throw new Error('Failed to find documents on <' + collection + '> with query <' + JSON.stringify(query) + '> : No cursor'); 
			}

			cursor.toArray(function(err, result) {

				if (err) {
					throw new Error('Failed to find documents on <' + collection + '> with query <' + JSON.stringify(query) + '> : ' + err); 
				} else if (result == null) {
					throw new Error('Failed to find documents on <' + collection + '> with query <' + JSON.stringify(query) + '> : No result list'); 
				}

				callback(result); 
			}); 

		} catch(e) {
			throw new Error('Error caught on find request : ' + e.name + ': ' + e.message); 
		}
	}); 
}


module.exports.remove = function(collection, query, callback) {

	module.exports.connect(function(db) {
		try {

			var cursor = db.collection(collection).find(query);
			if (cursor == null) {
				throw new Error('Failed to remove a document on <' + collection + '> with query <' + JSON.stringify(query) + '> : No cursor'); 
			}

			cursor.toArray(function(err, result) {

				if (err) {
					throw new Error('Failed to remove a document on <' + collection + '> with query <' + JSON.stringify(query) + '> : ' + err); 
				} else if (result == null) {
					throw new Error('Failed to remove a document on <' + collection + '> with query <' + JSON.stringify(query) + '> : No result list'); 
				} else  {

					db.collection(collection).remove(query, function(err, r) {

						if (err) {
							throw new Error('Error caught on remove request : ' + e.name + ': ' + e.message);
						}

						callback(result); 
					}); 
				}
			}); 

		} catch(e) {
			throw new Error('Error caught on remove request : ' + e.name + ': ' + e.message); 
		}
	}); 
}


clear = function(db) {

	db.collection(mod_db_classes.getCollectionName()).remove();
	db.collection(mod_db_courses.getCollectionName()).remove();
	db.collection(mod_db_sessions.getCollectionName()).remove();
	db.collection(mod_db_users.getCollectionName()).remove();
}


//Useful functions
/////////////////////////////////////////////////////////////////////////////////////




