
//Imports and constants
/////////////////////////////////////////////////////////////////////////////////////


var mod_db = require('./manager');
var mod_db_sessions = require('./sessions'); 
var mod_db_users = require('./users'); 
var mod_db_classes = require('./classes'); 
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

	this.students = new Array(); 

	this.addStudent = function(user) {
		if (! this.hasStudent(user)) {
			this.students.push(user); 
		}
	};

	this.removeStudent = function(user) {
		var hasBeenRemoved = false; 
		var i = 0; 
		while (! hasBeenRemoved && i < this.students.length) {
			if(this.students[i] == user) {
				this.students.splice(i, 1); 
				hasBeenRemoved = true;
			}
			i++;
		}
		if(!hasBeenRemoved){
			throw new Error('Student could not be found for removal');
		}
	};

	this.hasStudent = function(user) {
		var isStudent = false; 
		var i = 0; 
		while (! isStudent && i < this.students.length) {
			isStudent = (this.students[i] == user);
			i++;
		}
		return isStudent; 
	};
}


function CourseInfo(success, message, data) {

	mod_db.ServerInfo.call(this, success, message, data); 

	this.update = function(callback) {

		if (this.result == undefined || this.result == null) {
			callback(this); 
		} else if (this.result instanceof Array) {
			callback(this); 
		} else {
			dbToCourse(this, this.result, function(that, course) {
				that.result = course; 
				callback(that); 
			}); 
		}
	}
}

CourseInfo.prototype = mod_db.ServerInfo; 

var makeCourseInfo = function(success, message, data, callback) {

	var courseInfo = new CourseInfo(success, message, data); 
	courseInfo.update(callback); 
};


//External API
/////////////////////////////////////////////////////////////////////////////////////


module.exports.requestCreate = function(req, res) {

	if (mod_db.checkParams(req, res, ['token', 'name', 'description'])) {

		mod_db_sessions.authenticate(req.param('token'), function(sessionInfo) {

			if (! sessionInfo.success) {
				callback(new CourseInfo(false, 'Failed to create a course: ' + sessionInfo.message)); 
				return;
			}

			module.exports.create(sessionInfo.result.user, req.param('name'), req.param('description'), function(info) {
				res.send(info); 
			}); 
		}); 
	}
};


module.exports.requestList = function(req, res) {

	if (mod_db.checkParams(req, res, ['token'])) {

		mod_db_sessions.authenticate(req.param('token'), function(sessionInfo) {

			if (! sessionInfo.success) {
				callback(new CourseInfo(false, 'Failed to list the courses: ' + sessionInfo.message)); 
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
				callback(new CourseInfo(false, 'Failed to get course #' + req.param('id') + ' : ' + sessionInfo.message)); 
				return;
			}

			module.exports.get(req.param('id'), function(info) {
				res.send(info); 
			}); 
		}); 
	}
};


module.exports.requestUpdate = function(req, res) {

	if (mod_db.checkParams(req, res, ['token', 'id', 'name', 'teacher', 'description'])) {

		mod_db_sessions.authenticate(req.param('token'), function(sessionInfo) {

			if (! sessionInfo.success) {
				callback(new CourseInfo(false, 'Failed to get course #' + req.param('id') + ' : ' + sessionInfo.message)); 
				return;
			}

			module.exports.update(sessionInfo.result.user, req.param('id'), req.param('name'), req.param('teacher'), req.param('description'), [], function(info) {
				res.send(info); 
			}); 
		}); 
	}
};


module.exports.requestRemove = function(req, res) {

	if (mod_db.checkParams(req, res, ['token', 'id'])) {

		mod_db_sessions.authenticate(req.param('token'), function(sessionInfo) {

			if (! sessionInfo.success) {
				callback(new CourseInfo(false, 'Failed to remove course #' + req.param('id') + ' : ' + sessionInfo.message)); 
				return;
			}

			module.exports.remove(sessionInfo.result.user, req.param('id'), function(info) {
				res.send(info); 
			}); 
		}); 
	}
};


module.exports.requestEnrol = function(req, res) {

	if (mod_db.checkParams(req, res, ['token', 'id'])) {

		mod_db_sessions.authenticate(req.param('token'), function(sessionInfo) {

			if (! sessionInfo.success) {
				callback(new CourseInfo(false, 'Failed to remove course #' + req.param('id') + ' : ' + sessionInfo.message)); 
				return;
			}

			module.exports.enrol(sessionInfo.result.user, req.param('id'), function(info) {
				res.send(info); 
			}); 
		}); 
	}
};


module.exports.requestQuit = function(req, res) {

	if (mod_db.checkParams(req, res, ['token', 'id'])) {

		mod_db_sessions.authenticate(req.param('token'), function(sessionInfo) {

			if (! sessionInfo.success) {
				callback(new CourseInfo(false, 'Failed to remove course #' + req.param('id') + ' : ' + sessionInfo.message)); 
				return;
			}

			module.exports.quit(sessionInfo.result.user, req.param('id'), function(info) {
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

	var web_srv = new Course('web_srv', 'peter', 'Programmation Web côté Serveur'); 
	var web_cli = new Course('web_cli', 'michel', 'Programmation Web côté Client'); 
	var web_sem = new Course('web_sem', 'peter', 'Web Sémantique'); 

	var initializationData = [web_srv, web_cli, web_sem];

	var collection = db.collection(DbName);
	for (var index in initializationData) {
		collection.insert(initializationData[index]); 
	}
};


module.exports.findByName = function(name, callback) {

	mod_db.find(DbName, { name: name }, function(result) {

		if (result.length == 0) {
			logger.out('No course named <' + name + '> found')
			callback(new CourseInfo(false, 'Course <' + name + '> unknown')); 
			return;
		} else if (result.length > 1) {
			throw new Error('More than one course with the same name were found');
		}

		makeCourseInfo(true, '', result[0], callback); 
	});
};


module.exports.findById = function(id, callback) {

	mod_db.find(DbName, { id: +id }, function(result) {

		if (result.length == 0) {
			logger.out('No course #' + id + ' found')
			callback(new CourseInfo(false, 'Course #' + id + ' unknown')); 
			return;
		} else if (result.length > 1) {
			throw new Error('More than one course with the same ID were found');
		}

		makeCourseInfo(true, '', result[0], callback); 
	});
};


module.exports.findByTeacher = function(login, callback) {

	mod_db.find(DbName, { teacher: login }, function(result) {

		makeCourseInfo(true, '', result, callback); 
	});
};


module.exports.get = function(id, callback) {

	module.exports.findById(id, function(courseInfo) {
		callback(courseInfo); 
	}); 
};


module.exports.list = function(callback) {

	mod_db.find(DbName, { }, function(result) {

		makeCourseInfo(true, '', result, callback); 
	});
};


module.exports.create = function(user, name, description, callback) {

	if (user.role < mod_db_users.Roles.TEACHER) {
		callback(new CourseInfo(false, 'The user <' + user.login + '> doesn\'t have permission to create a course')); 
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
			var course = new Course(name, user.login, description); 
			mod_db.insert(DbName, courseToDb(course)); 
			makeCourseInfo(true, '', course, callback); 
		}
	}); 
};


module.exports.remove = function(user, id, callback) {

	if (user.role < mod_db_users.Roles.TEACHER) {
		callback(new CourseInfo(false, 'The user <' + user.login + '> doesn\'t have permission to delete a course')); 
		return; 
	} 

	module.exports.findById(id, function(courseInfo) {
		if (courseInfo.success) {

			if (user.role < mod_db_users.Roles.ADMIN && courseInfo.result.teacher.login != user.login) {
				callback(new CourseInfo(false, 'A teacher can\'t delete someone else\'s course')); 
				return; 
			}

			mod_db_classes.findByCourse(id, function(classeInfo) {

				ids = new Array(); 
				for (var i = 0; i < classeInfo.result.length; i++) {
					ids.push(classeInfo.result[i].id); 
				}

				mod_db_classes.removeAll(user, ids, function(classeInfoBis) { 

					if (! classeInfoBis.success) {
						throw new Error('Failed to remove classes linked to course #' + id + ' to be removed : ' + classeInfoBis.message); 
					}

					mod_db.remove(DbName, { id: +id }, function(result) {

						if (result.length == 0) {
							callback(new CourseInfo(false, 'Failed to delete a course: The course #' + id + ' is unknown')); 
							return;
						} else if (result.length > 1) {
							throw new Error("More than one course with the same ID were found");
						}

						makeCourseInfo(true, '', result[0], callback); 
					}); 

				}); 
			}); 

		} else {
			callback(new CourseInfo(false, 'Failed to remove course #' + id + ' : ' + courseInfo.message));
		}
	}); 
};


module.exports.updateCourse = function(user, course, callback) {

	module.exports.update(user, course.id, course.name, course.teacher, course.description, course.students, callback); 
};


module.exports.update = function(user, id, name, teacher, description, students, callback) {

	if (user.role < mod_db_users.Roles.TEACHER) {
		callback(new CourseInfo(false, 'The user <' + user.login + '> doesn\'t have permission to update a course')); 
		return; 
	} 

	module.exports.findById(id, function(courseInfo) {
		if (courseInfo.success) {

			if (user.role < mod_db_users.Roles.ADMIN && courseInfo.result.teacher.login != user.login) {
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
				course.students = courseInfo.result.students;
				students.forEach(function(student) {
					course.students.push(student); 
				}); 
				db.collection(DbName).update({ id: +id }, courseToDb(course));

				makeCourseInfo(true, '', course, callback); 
			});

		} else {
			callback(new CourseInfo(false, 'Failed to update course #' + id + ' : ' + courseInfo.message));
		}
	});
};


module.exports.enrol = function(user, id, callback) {

	module.exports.findById(id, function(courseInfo) {

		if (! courseInfo.success) {
			callback(new CourseInfo(false, 'Failed to enrol in course #' + id + ' : ' + courseInfo.message)); 
			return;
		}
		var course = courseInfo.result; 

		if (course.hasStudent(user.login)) {
			callback(new CourseInfo(false, 'The user <' + user.login + '> is already enrolled in course #' + id)); 
			return; 
		} else if (course.teacher.login == user.login) {
			callback(new CourseInfo(false, 'A teacher can\'t be enrolled in its own course')); 
			return; 
		}

		course.addStudent(user.login); 

		mod_db.connect(function(db) {

			db.collection(DbName).update({ id: +(course.id) }, courseToDb(course));
			makeCourseInfo(true, '', course, callback); 
		}); 
	});
};


module.exports.quit = function(user, id, callback) {

	module.exports.findById(id, function(courseInfo) {

		if (! courseInfo.success) {
			callback(new CourseInfo(false, 'Failed to quit course #' + id + ' : ' + courseInfo.message)); 
			return;
		}
		var course = courseInfo.result; 

		if (! course.hasStudent(user.login)) {
			callback(new CourseInfo(false, 'The user <' + user.login + '> is not enrolled in course #' + id)); 
			return; 
		} 

		course.removeStudent(user.login); 

		mod_db.connect(function(db) {

			db.collection(DbName).update({ id: +(course.id) }, courseToDb(course));
			makeCourseInfo(true, '', course, callback); 
		}); 
	});
};




//Useful functions
/////////////////////////////////////////////////////////////////////////////////////


function dbToCourse(that, c, callback) {

	if (typeof c.teacher == 'string') {

		mod_db_users.get(c.teacher, function(userInfo) {

			if (userInfo == null) {
				throw new Error('User info is null'); 
			} else if (! userInfo.success) {
				throw new Error('There should be a user <' + c.teacher + '> in DB'); 
			}

			var course = new Course(c.name, userInfo.result, c.description); 
			course.id = c.id; 
			course.students = c.students; 
			callback(that, course); 
		}); 

	} else {

		var course = new Course(c.name, c.teacher, c.description); 
		course.id = c.id; 
		course.students = c.students; 
		callback(that, course); 
	}
}


function courseToDb(c) {

	var teacher; 
	if (typeof c.teacher != 'string') {
		teacher = c.teacher.login; 
	} else {
		teacher = c.teacher; 
	}
	var course = new Course(c.name, teacher, c.description); 
	course.id = c.id; 
	course.students = c.students; 

	return course; 
}

