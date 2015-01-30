
//Imports and constants
/////////////////////////////////////////////////////////////////////////////////////


var mod_db = require('./manager');
var mod_db_sessions = require('./sessions'); 
var mod_db_users = require('./users'); 
var mod_utils = require('../utils'); 
var logger = require('../logger'); 

var DbName = 'courses'; 


//Objects
/////////////////////////////////////////////////////////////////////////////////////


//Template of document 'Course' in database
Course = function(name, teacher, description) {

	this.id = mod_utils.idGen.get(); 

	// Mandatory information
	this.name = name; 
	this.teacher = teacher; 
	this.description = description; 
}


function CourseInfo(success, message, data) {

	var course = null; 
	if (data != undefined && data != null) {

		if (data instanceof Array) {

			course = []; 
			for (var i = 0; i < data.length; i++) {

				var item = data[i]; 
				if (item != undefined && item != null) {
					course.push(dbToCourse(item)); 
				}
			}

		} else {
			course = dbToCourse(data); 
		}
	}

	mod_db.ServerInfo.call(this, success, message, course); 
}

CourseInfo.prototype = mod_db.ServerInfo; 


//External API
/////////////////////////////////////////////////////////////////////////////////////


module.exports.createRequest = function(req, res) {

	var parameters = ['token', 'name', 'description']; 
	for (var i = 0; i < parameters.length; i++) {
		if (req.param(parameters[i]) == null) {
			res.send(new CourseInfo(false, 'Property <' + parameters[i] + '> is missing')); 
			return; 
		} 
	}

	module.exports.create(req.param('token'), req.param('name'), req.param('description'), function(info) {
		res.send(info); 
	}); 
}


module.exports.listRequest = function(req, res) {

	var parameters = ['token']; 
	for (var i = 0; i < parameters.length; i++) {
		if (req.param(parameters[i]) == null) {
			res.send(new CourseInfo(false, 'Property <' + parameters[i] + '> is missing')); 
			return; 
		} 
	}

	module.exports.list(req.param('token'), function(infos) {
		res.send(infos); 
	}); 
}


module.exports.getRequest = function(req, res) {

	var parameters = ['token', 'id']; 
	for (var i = 0; i < parameters.length; i++) {
		if (req.param(parameters[i]) == null) {
			res.send(new CourseInfo(false, 'Property <' + parameters[i] + '> is missing')); 
			return; 
		} 
	}

	module.exports.get(req.param('token'), req.param('id'), function(info) {
		res.send(info); 
	}); 
}


module.exports.updateRequest = function(req, res) {

	var parameters = ['token', 'id', 'name', 'teacher', 'description']; 
	for (var i = 0; i < parameters.length; i++) {
		if (req.param(parameters[i]) == null) {
			res.send(new CourseInfo(false, 'Property <' + parameters[i] + '> is missing')); 
			return; 
		} 
	}

	module.exports.update(req.param('token'), req.param('id'), req.param('name'), req.param('teacher'), req.param('description'), function(info) {
		res.send(info); 
	}); 
}


module.exports.removeRequest = function(req, res) {

	var parameters = ['token', 'id']; 
	for (var i = 0; i < parameters.length; i++) {
		if (req.param(parameters[i]) == null) {
			res.send(new CourseInfo(false, 'Property <' + parameters[i] + '> is missing')); 
			return; 
		} 
	}

	module.exports.remove(req.param('token'), req.param('id'), function(info) {
		res.send(info); 
	}); 
}


//Local API
/////////////////////////////////////////////////////////////////////////////////////


module.exports.getCollectionName = function() {
	return DbName; 
}


module.exports.initialize = function(db) {

	var collection = db.collection(module.exports.getCollectionName());

	// Définir les cours de base
	var web_srv = new Course('web_srv', 'peter', 'Programmation Web côté Serveur'); 
	var web_cli = new Course('web_cli', 'michel', 'Programmation Web côté Client'); 
	var web_sem = new Course('web_sem', 'peter', 'Web Sémantique'); 

	var initializationData = [web_srv, web_cli, web_sem];

	// Ajout des cours prédéfinis
	for (var index in initializationData) {
		collection.insert(initializationData[index]); 
	}
}


module.exports.findByName = function(name, callback) {

	mod_db.find(DbName, { name: name }, function(result) {

		if (result.length == 0) {
			logger.out('No course named <' + name + '> found')
			callback(new CourseInfo(false, 'Course <' + name + '> unknown')); 
			return;
		} else if (result.length > 1) {
			throw new Error('More than one course with the same name were found');
		}

		callback(new CourseInfo(true, '', result[0])); 
	});
}


module.exports.findById = function(id, callback) {

	mod_db.find(DbName, { id: +id }, function(result) {

		if (result.length == 0) {
			logger.out('No course #' + id + ' found')
			callback(new CourseInfo(false, 'Course #' + id + ' unknown')); 
			return;
		} else if (result.length > 1) {
			throw new Error('More than one course with the same ID were found');
		}

		callback(new CourseInfo(true, '', result[0])); 
	});
}


module.exports.get = function(token, id, callback) {

	mod_db_sessions.authenticate(token, function(sessionInfo) {

		if (! sessionInfo.success) {
			callback(new CourseInfo(false, 'Failed to get course #' + id + ' : ' + sessionInfo.message)); 
			return;
		}

		module.exports.findById(id, function(courseInfo) {
			callback(courseInfo); 
		}); 
	}); 
}


module.exports.list = function(token, callback) {

	mod_db_sessions.authenticate(token, function(sessionInfo) {

		if (! sessionInfo.success) {
			callback(new CourseInfo(false, 'Failed to list the courses : ' + sessionInfo.message)); 
			return;
		}

		mod_db.find(DbName, { }, function(result) {

			callback(new CourseInfo(true, '', result)); 
		});
	});
}


module.exports.create = function(token, name, description, callback) {

	mod_db_sessions.authenticate(token, function(sessionInfo) {

		if (! sessionInfo.success) {
			callback(new CourseInfo(false, 'Failed to create course <' + name + '> : ' + sessionInfo.message)); 
			return;
		}

		if (sessionInfo.result.user.role < mod_db_users.Roles.TEACHER) {
			callback(new CourseInfo(false, 'The user <' + sessionInfo.result.user.login + '> doesn\'t have permission to create a course')); 
			return; 
		} 
		
		if (name == '') {
			callback(new CourseInfo(false, 'Failed to create course : empty name')); 
			return;
		}

		module.exports.findByName(name, function(courseInfo) {
			if (courseInfo.success) {
				callback(new CourseInfo(false, 'Failed to create a course: A course with the same name <' + name + '> already exists'));
			} else {
				var course = new Course(name, sessionInfo.result.user.login, description); 
				mod_db.insert(DbName, course); 
				callback(new CourseInfo(true, '', course)); 
			}
		}); 
	}); 
}


module.exports.remove = function(token, id, callback) {

	mod_db_sessions.authenticate(token, function(sessionInfo) {

		if (! sessionInfo.success) {
			callback(new CourseInfo(false, 'Failed to delete course #' + id + ' : ' + sessionInfo.message)); 
			return;
		}

		if (sessionInfo.result.user.role < mod_db_users.Roles.TEACHER) {
			callback(new CourseInfo(false, 'The user <' + sessionInfo.result.user.login + '> doesn\'t have permission to delete a course')); 
			return; 
		} 

		module.exports.findById(id, function(courseInfo) {
			if (courseInfo.success) {

				if (sessionInfo.result.user.role < mod_db_users.Roles.ADMIN && courseInfo.result.teacher != sessionInfo.result.user.role) {
					callback(new CourseInfo(false, 'A teacher can\'t delete someone else\'s course')); 
					return; 
				}

				mod_db.remove(DbName, { id: +id }, function(result) {
					
					if (result.length == 0) {
						callback(new CourseInfo(false, 'Failed to delete a course: The course #' + id + ' unknown')); 
						return;
					} else if (result.length > 1) {
						throw new Error("More than one course with the same ID were found");
					}
					
					callback(new CourseInfo(true, '', result[0]));
				}); 

			} else {
				callback(new CourseInfo(false, 'Failed to remove course #' + id + ' : ' + courseInfo.message));
			}
		}); 
	});
}


module.exports.update = function(token, id, name, teacher, description, callback) {

	mod_db_sessions.authenticate(token, function(sessionInfo) {

		if (! sessionInfo.success) {
			callback(new CourseInfo(false, 'Failed to update course #' + id + ' : ' + sessionInfo.message)); 
			return;
		}

		if (sessionInfo.result.user.role < mod_db_users.Roles.TEACHER) {
			callback(new CourseInfo(false, 'The user <' + sessionInfo.result.user.login + '> doesn\'t have permission to update a course')); 
			return; 
		} 

		module.exports.findById(id, function(courseInfo) {
			if (courseInfo.success) {

				if (sessionInfo.result.user.role < mod_db_users.Roles.ADMIN && courseInfo.result.teacher != sessionInfo.result.user.role) {
					callback(new CourseInfo(false, 'A teacher can\'t update someone else\'s course')); 
					return; 
				}

				if (name == '') {
					callback(new CourseInfo(false, 'Failed to update course : empty name')); 
					return;
				}

				mod_db.connect(function(db) {

					var course = new Course(name, teacher, description); 
					course.id = +id; 
					db.collection(DbName).update({ id: +id }, course);

					callback(new CourseInfo(true, '', course)); 
				});

			} else {
				callback(new CourseInfo(false, 'Failed to update course #' + id + ' : ' + courseInfo.message));
			}
		}); 
	});
}


//Useful functions
/////////////////////////////////////////////////////////////////////////////////////


function dbToCourse(c) {

	var course = new Course(c.name, c.teacher, c.description); 
	course.id = c.id; 

	return course; 
}



