
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


module.exports.connect = function(cb) {
	
	if (db) {
		cb(db);
		return;
	}
	
	mongo.connect(url, function(err, conn) {
		console.log("Connection to DB at url <" + url +">");
		
		if (url == "" || !conn) {
			logger.err("DB connection error");
		} else if (err) {
			logger.err("Error on connection: " + err.message);
		} else {
			db = conn;
			cb(db);
		}
	});
};

module.exports.clear = function(db){

	db.collection(mod_db_classes.getCollectionName()).remove();
	db.collection(mod_db_courses.getCollectionName()).remove();
	db.collection(mod_db_sessions.getCollectionName()).remove();
	db.collection(mod_db_users.getCollectionName()).remove();
}

module.exports.initialize = function(databaseName) {
	
	url = mongoDbUrlBase + databaseName;

	module.exports.connect(function(db) {
		module.exports.clear(db);

		mod_db_users.initialize(db);
		mod_db_courses.initialize(db);
	});
};


