
var node_mongodb = require('mongodb');


var mongoDbUrlBase = "mongodb://localhost:27017/";

var url = "";

var mongo = node_mongodb.MongoClient;

var db = null;


module.exports.initialize = function(databaseName) {
	url = mongoDbUrlBase + databaseName;
};


module.exports.connect = function(cb) {
	
	if (db) {
		cb(db);
		return;
	}
	
	mongo.connect(url, function(err, conn) {
		console.log("Connection to DB at url <" + url +">");
		
		if (url == "" || !conn) {
			console.err("DB connection error");
		} else if (err) {
			console.err("Error on connection: " + err.message);
		} else {
			db = conn;
			cb(db);
		}
	});
};