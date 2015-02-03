
//Imports and constants
/////////////////////////////////////////////////////////////////////////////////////


var mod_db = require('./manager');
var mod_utils = require('../utils'); 
var logger = require('../logger'); 

var DbName = 'classes'; 


//Objects
/////////////////////////////////////////////////////////////////////////////////////


//Template of document 'Classe' in database
Classe = function(course, subject, begin) {

	this.id = mod_utils.idGen.get(); 

	// Mandatory information
	this.course = course; 
	this.subject = subject; 
	
	if (begin == undefined || begin == null) {
		this.begin = new Date(); 
	} else {
		this.begin = begin;
	}
	this.end = 0; 
}


function ClasseInfo(success, message, data) {

	mod_db.ServerInfo.call(this, success, message, data); 

	this.update = function(callback) {

		if (this.result == undefined || this.result == null) {
			callback(this); 
		} else if (this.result instanceof Array) {
			// TODO
			callback(this); 
		} else {
			dbToClasse(this, this.result, function(that, classe) {
				that.result = classe; 
				callback(that); 
			}); 
		}
	}
}

ClasseInfo.prototype = mod_db.ServerInfo; 

var makeClasseInfo = function(success, message, data, callback) {

	var classeInfo = new ClasseInfo(success, message, data); 
	classeInfo.update(callback); 
}


//External API
/////////////////////////////////////////////////////////////////////////////////////


module.exports.getCollectionName = function() {
	return DbName; 
}


module.exports.initialize = function(req, res) {
	// TODO
}


module.exports.requestStart = function(req, res) {
	// TODO
}


module.exports.requestList = function(req, res) {
	// TODO
}


module.exports.requestGet = function(req, res) {
	// TODO
}


module.exports.requestUpdate = function(req, res) {
	// TODO
}


module.exports.requestEnd = function(req, res) {
	// TODO
}


//Local API
/////////////////////////////////////////////////////////////////////////////////////


//Useful functions
/////////////////////////////////////////////////////////////////////////////////////


function dbToClasse(that, c, callback) {

	mod_db_courses.get(c.course, function(courseInfo) {

		if (courseInfo == null) {
			throw new Error('Course info is null'); 
		} else if (! courseInfo.success) {
			throw new Error('There should be a course <' + c.course + '> in DB'); 
		}

		var classe = new Classe(courseInfo.result, c.subject, c.begin); 
		classe.id = c.id; 
		callback(that, classe); 
	}); 

}


