
//Imports and constants
/////////////////////////////////////////////////////////////////////////////////////


var mod_db = require('./manager');
var mod_db_courses = require('./courses');
var mod_db_users = require('./users'); 
var mod_utils = require('../utils'); 
var logger = require('../logger'); 

var DbName = 'classes'; 


//Objects
/////////////////////////////////////////////////////////////////////////////////////


//Template of document 'Classe' in database
Classe = function(course, subject, begin, end) {

	this.id = mod_utils.idGen.get(); 

	// Mandatory information
	this.course = course; 
	this.subject = subject; 

	if (begin == undefined || begin == null || begin == 0 || begin == '') {
		this.begin = new Date(); 
	} else {
		this.begin = begin;
	}
	if (end == undefined || end == null || end == 0 || end == '') {
		this.end = 0; 
	} else {
		this.end = end;
	}
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


module.exports.requestStart = function(req, res) {

	if (mod_db.checkParams(req, res, ['token', 'course', 'subject', 'begin', 'end'])) {

		mod_db_sessions.authenticate(req.param('token'), function(sessionInfo) {

			if (! sessionInfo.success) {
				callback(new CourseInfo(false, 'Failed to list the courses : ' + sessionInfo.message)); 
				return;
			}

			module.exports.create(sessionInfo.result.user, req.param('course'), req.param('subject'), req.param('begin'), req.param('end'), function(info) {
				res.send(info); 
			}); 
		}); 
	}
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


module.exports.getCollectionName = function() {
	return DbName; 
}


module.exports.initialize = function(db) {

	var date1 = new Date(); 
	date1.setDate(date1.getDate() - 3); 
	var date2 = new Date(); 
	date2.setDate(date2.getDate() - 3); 
	var classe1 = new Classe(1, 'NoSQL', date1, date2); 
	
	date1 = new Date(); 
	date1.setHours(date1.getHours() - 1); 
	var classe2 = new Classe(2, 'HTML 5', date1); 
	
	date1 = new Date(); 
	date1.setDate(date1.getDate() + 2); 
	date2 = new Date(); 
	date2.setDate(date2.getDate() + 2); 
	date2.setHours(date2.getHours() + 2); 
	var classe3 = new Classe(1, 'NodeJs', date1, date2); 
	
	var initializationData = [classe1, classe2, classe3];

	var collection = db.collection(DbName);
	for (var index in initializationData) {
		collection.insert(initializationData[index]); 
	}
}


module.exports.create = function(user, course, subject, begin, end, callback) {
	
	if (user.role < mod_db_users.Roles.TEACHER) {
		callback(new ClasseInfo(false, 'Only a teacher can create a classroom'));
	} 
	
	mod_db_courses.get(course, function(courseInfo) {
		
		if (! courseInfo.success) {
			callback(new ClasseInfo(false, 'Failed to create a classroom : ' + courseInfo.message)); 
		}
		
		if (user.role < mod_db_users.Roles.ADMIN && user.login != courseInfo.result.teacher) {
			callback(new ClasseInfo(false, 'Only the teacher of a course can create a classroom for it'));
		}
		
		if (end != null && end != 0 && end != '') {
			if (end < Date()) {
				callback(new ClasseInfo(false, 'A class can\'t be created in the past'));
			}
			if (begin != null && begin != 0 && begin != '') {
				if (begin >= end) {
					callback(new ClasseInfo(false, 'A class must begin before ending'));
				}
			}
		}
		
		var classe = new Classe(course, subject, begin, end); 
		mod_db.insert(DbName, classe); 
		makeClasseInfo(true, '', classe, callback); 
	})
}


//Useful functions
/////////////////////////////////////////////////////////////////////////////////////


function dbToClasse(that, c, callback) {

	mod_db_courses.get(c.course, function(courseInfo) {

		if (courseInfo == null) {
			throw new Error('Course info is null'); 
		} else if (! courseInfo.success) {
			throw new Error('There should be a course <' + c.course + '> in DB'); 
		}

		var classe = new Classe(courseInfo.result, c.subject, c.begin, c.end); 
		classe.id = c.id; 
		callback(that, classe); 
	}); 

}


