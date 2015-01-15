//var mongoose = require('mongoose');
//var UserSchema = require('user');
var mongodb = require('mongodb');
var mongoDbUrlBase = "mongodb://localhost:27017/";
var url = "";

var MongoClient = mongodb.MongoClient;
var db = null;

module.exports.initialize = function(databaseName){
	url = mongoDbUrlBase + databaseName;
};

module.exports.connect = function(cb){
	if(db){
		cb(db);
		return;
	}
	MongoClient.connect(url, function(err, conn) {
		console.log("Connection à l'url " + url);
		if(url == "" || !conn){
			console.log("Url de connection à la DB KO");
			throw new Error("DB connection error");
		} 
		if(err){
			console.log(err.message);
			throw new Error(err);
		} else {
			db = conn;
			cb(db);
		}
	});
};