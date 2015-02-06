
//Imports and constants
/////////////////////////////////////////////////////////////////////////////////////


var mod_db = require('./manager');
var mod_db_courses = require('./courses');
var mod_db_users = require('./users'); 
var mod_db_sessions = require('./sessions'); 
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

	if (begin == undefined || begin == null) {
		this.begin = new Date(); 
	} else {
		this.begin = begin;
	}
	if (end == undefined || end == null) {
		this.end = null; 
	} else {
		this.end = end;
	}
};


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
};


//External API
/////////////////////////////////////////////////////////////////////////////////////


module.exports.requestStart = function(req, res) {

	if (mod_db.checkParams(req, res, ['token', 'course', 'subject', 'begin', 'end'])) {

		mod_db_sessions.authenticate(req.param('token'), function(sessionInfo) {

			if (! sessionInfo.success) {
				callback(new CourseInfo(false, 'Failed to start a classroom: ' + sessionInfo.message)); 
				return;
			}

			var begin = req.param('begin'); 
			var beginDate = null; 
			if (begin != 0 && begin != '') {
				beginDate = new Date(begin); 
			}
			var end = req.param('end'); 
			var endDate = null; 
			if (end != 0 && end != '') {
				endDate = new Date(end); 
			}
			
			module.exports.create(sessionInfo.result.user, req.param('course'), req.param('subject'), beginDate, endDate, function(info) {
				res.send(info); 
			}); 
		}); 
	}
};


module.exports.requestEnd = function(req, res) {

	if (mod_db.checkParams(req, res, ['token', 'id'])) {

		mod_db_sessions.authenticate(req.param('token'), function(sessionInfo) {

			if (! sessionInfo.success) {
				callback(new CourseInfo(false, 'Failed to end a classroom #' + id + ' : ' + sessionInfo.message)); 
				return;
			}

			module.exports.end(sessionInfo.result.user, req.param('id'), function(info) {
				res.send(info); 
			}); 
		}); 
	}
};


module.exports.requestList = function(req, res) {

	if (mod_db.checkParams(req, res, ['token'])) {

		mod_db_sessions.authenticate(req.param('token'), function(sessionInfo) {

			if (! sessionInfo.success) {
				callback(new CourseInfo(false, 'Failed to list the classrooms: ' + sessionInfo.message)); 
				return;
			}

			module.exports.list(function(infos) {
				res.send(infos); 
			}); 
		}); 
	}
};


module.exports.requestGet = function(req, res) {

	if (mod_db.checkParams(req, res, ['token', 'id'])) {

		mod_db_sessions.authenticate(req.param('token'), function(sessionInfo) {

			if (! sessionInfo.success) {
				callback(new CourseInfo(false, 'Failed to get classroom #' + req.param('id') + ' : ' + sessionInfo.message)); 
				return;
			}

			module.exports.get(req.param('id'), function(info) {
				res.send(info); 
			}); 
		}); 
	}
};


module.exports.requestUpdate = function(req, res) {

	if (mod_db.checkParams(req, res, ['token', 'id', 'course', 'begin', 'end'])) {

		mod_db_sessions.authenticate(req.param('token'), function(sessionInfo) {

			if (! sessionInfo.success) {
				callback(new CourseInfo(false, 'Failed to update classroom #' + req.param('id') + ' : ' + sessionInfo.message)); 
				return;
			}

			var begin = req.param('begin'); 
			var beginDate = null; 
			if (begin != 0 && begin != '') {
				beginDate = new Date(begin); 
			}
			var end = req.param('end'); 
			var endDate = null; 
			if (end != 0 && end != '') {
				endDate = new Date(end); 
			}
			
			module.exports.update(req.param('id'), req.param('course'), beginDate, endDate, function(info) {
				res.send(info); 
			}); 
		}); 
	}
};


module.exports.requestJoin = function(req, res) {

	if (mod_db.checkParams(req, res, ['token', 'id'])) {

		mod_db_sessions.authenticate(req.param('token'), function(sessionInfo) {

			if (! sessionInfo.success) {
				callback(new CourseInfo(false, 'Failed to join classroom #' + req.param('id') + ' : ' + sessionInfo.message)); 
				return;
			}

			module.exports.join(sessionInfo.result.user, req.param('id'), function(info) {
				res.send(info); 
			}); 
		}); 
	}
};


module.exports.requestLeave = function(req, res) {

	if (mod_db.checkParams(req, res, ['token', 'id'])) {

		mod_db_sessions.authenticate(req.param('token'), function(sessionInfo) {

			if (! sessionInfo.success) {
				callback(new CourseInfo(false, 'Failed to leave classroom #' + req.param('id') + ' : ' + sessionInfo.message)); 
				return;
			}

			module.exports.leave(sessionInfo.result.user, req.param('id'), function(info) {
				res.send(info); 
			}); 
		}); 
	}
};


//Local API
/////////////////////////////////////////////////////////////////////////////////////


module.exports.getCollectionName = function() {
	return DbName; 
};


module.exports.initialize = function(db) {

	var date1 = new Date(); 
	date1.setDate(date1.getDate() - 3); 
	var date2 = new Date(); 
	date2.setDate(date2.getDate() - 3); 
	date2.setHours(date2.getHours() + 1); 
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
};


module.exports.list = function(callback) {

	mod_db.find(DbName, { }, function(result) {

		makeClasseInfo(true, '', result, callback); 
	});
}; 


module.exports.create = function(user, course, subject, begin, end, callback) {

	if (user.role < mod_db_users.Roles.TEACHER) {
		callback(new ClasseInfo(false, 'Only a teacher can end a classroom'));
		return; 
	} 

	mod_db_courses.get(course, function(courseInfo) {

		if (! courseInfo.success) {
			callback(new ClasseInfo(false, 'Failed to create a classroom : ' + courseInfo.message)); 
			return; 
		}

		if (user.role < mod_db_users.Roles.ADMIN && user.login != courseInfo.result.teacher.login) {
			callback(new ClasseInfo(false, 'Only the teacher of a course can create a classroom for it'));
			return; 
		}

		if (end != null) {
			var current = new Date(); 
			if (end.getTime() < current.getTime()) {
				callback(new ClasseInfo(false, 'A class can\'t be created in the past'));
				return; 
			}
			if (begin != null) {
				if (begin.getTime() >= end.getTime()) {
					callback(new ClasseInfo(false, 'A class must begin before ending'));
					return; 
				}
			}
		}

		var classe = new Classe(course, subject, begin, end); 
		mod_db.insert(DbName, classe); 
		makeClasseInfo(true, '', classe, callback); 
	})
};


module.exports.end = function(user, classe, callback) {

	if (user.role < mod_db_users.Roles.TEACHER) {
		callback(new ClasseInfo(false, 'Only a teacher can end a classroom'));
		return; 
	} 

	module.exports.findById(classe, function(classeInfo) {

		if (! classeInfo.success) {
			callback(new ClasseInfo(false, 'Failed to end a classroom : ' + classeInfo.message)); 
			return; 
		}
		var classe = classeInfo.result; 

		if (user.role < mod_db_users.Roles.ADMIN && user.login != classe.course.teacher.login) {
			callback(new ClasseInfo(false, 'Only the teacher of a course can end a classroom related to it'));
			return; 
		}

		var end; 
		if (classe.end != null) {
			callback(new ClasseInfo(false, 'The classroom <' + classe.id + '> has already ended'));
			return; 
		} else {
			end = new Date(); 
		}
		
		if (classe.start == null) {
			callback(new ClasseInfo(false, 'The classroom <' + classe.id + '> hasn\'t begun yet'));
			return; 
		}

		module.exports.updateClasse(DbName, new Classe(classe.course, classe.subject, classe.begin, end), callback); 
	})
};


module.exports.updateClasse = function(user, classe, callback) {

	module.exports.update(user, classe.id, classe.course, classe.subject, classe.begin, classe.end, callback); 
};


module.exports.update = function(user, id, course, subject, begin, end, callback) {

	if (user.role < mod_db_users.Roles.TEACHER) {
		callback(new classInfo(false, 'The user <' + user.login + '> doesn\'t have permission to update a classroom')); 
		return; 
	} 

	module.exports.findById(id, function(classInfo) {
		if (classInfo.success) {

			if (user.role < mod_db_users.Roles.ADMIN && classInfo.result.course.teacher.login != user.login) {
				callback(new classInfo(false, 'A teacher can\'t update someone else\'s classroom')); 
				return; 
			}

			mod_db.connect(function(db) {

				var classe = new Classe(course, subject, begin, end); 
				classe.id = +id; 
				classe.begin = classInfo.result.begin;
				classe.end = classInfo.result.end;
				db.collection(DbName).update({ id: +id }, classe);

				makeClasseInfo(true, '', classe, callback); 
			});

		} else {
			callback(new CourseInfo(false, 'Failed to update classroom #' + id + ' : ' + makeClasseInfo.message));
		}
	});
};


module.exports.findById = function(id, callback) {

	mod_db.find(DbName, { id: +id }, function(result) {

		if (result.length == 0) {
			logger.out('No classroom #' + id + ' found')
			callback(new ClasseInfo(false, 'Classroom #' + id + ' unknown')); 
			return;
		} else if (result.length > 1) {
			throw new Error('More than one classroom with the same ID were found');
		}

		makeClasseInfo(true, '', result[0], callback); 
	});
};


module.exports.get = function(id, callback) {

	module.exports.findById(id, function(classeInfo) {
		callback(classeInfo); 
	}); 
};


module.exports.join = function(id, callback) {
	callback(new ClasseInfo(false, 'TODO')); 
}


module.exports.leave = function(id, callback) {
	callback(new ClasseInfo(false, 'TODO')); 
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

		var beginDate = c.begin; 
		if (beginDate instanceof String) {
			beginDate = new Date(beginDate); 
		}
		var endDate = c.end; 
		if (endDate instanceof String) {
			endDate = new Date(endDate); 
		}
		
		var classe = new Classe(courseInfo.result, c.subject, beginDate, endDate); 
		classe.id = c.id; 
		callback(that, classe); 
	}); 

}


