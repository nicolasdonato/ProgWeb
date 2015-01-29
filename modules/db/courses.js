
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

	// Mandatory information
	this.name = name; 
	this.teacher = teacher; 
	this.description = description; 

}

module.exports.Course = Course; 


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


//Update marchera en mélangeant create et remove mais  il y a un problème avec l'utilisation de name comme seule clé transmise au client car il peut la modifier et donc faire un update d'un truc qui n'existe pas
module.exports.updateRequest = function(req, res) {
	// TODO
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

	mod_db.connect(function(db) {

		var cursor = db.collection(DbName).find({ name : name });
		cursor.toArray(function(err, result) {

			if (err) {
				logger.err('Lookup for course named <' + name + '> failed: ' + err);
				callback(new CourseInfo(false, 'Course lookup process failed')); 
				return;
			} else if (result.length == 0) {
				logger.out('No course named <' + token + '> found')
				callback(new CourseInfo(false, 'Course unknown')); 
				return;
			} else if (result.length > 1) {
				throw new Exception('More than one course with the same name were found');
			}

			callback(new CourseInfo(true, '', result[0])); 
		});
	});
}


module.exports.get = function(token, name, callback) {

	mod_db_sessions.authenticate(token, function( info ) {

		if ( info.hasError() || ! info.isActive() ) {
			callback(new CourseInfo(false, info.error)); 
			return;
		}

		mod_db.connect(function(db) {

			var cursor = db.collection(DbName).find({ name : name });
			cursor.toArray(function(err, result) {

				if (err) {
					logger.err('Lookup for course named <' + name + '> failed: ' + err);
					callback(new CourseInfo(false, 'Course lookup process failed')); 
					return;
				} else if (result.length == 0) {
					logger.out('No course named <' + token + '> found')
					callback(new CourseInfo(false, 'Course unknown')); 
					return;
				} else if (result.length > 1) {
					throw new Exception('More than one course with the same name were found');
				}

				callback(new CourseInfo(true, '', result[0])); 
			});
		});
	}); 
}


module.exports.list = function(token, callback) {

	mod_db_sessions.authenticate(token, function( info ) {

		if ( info.hasError() || ! info.isActive() ) {
			callback(new CourseInfo(false, info.error)); 
			return;
		}

		mod_db.connect(function(db) {

			var cursor = db.collection(DbName).find();
			cursor.toArray(function(err, result){

				if (err) {
					logger.err('Lookup for all courses failed: ' + err);
					callback(new CourseInfo(false, 'Courses lookup process failed')); 
					return;
				} else if (result.length == 0) {
					logger.out('No course found')
					callback(new CourseInfo(false, 'No course found')); 
					return;
				}

				callback(new CourseInfo(true, '', result)); 
			});
		});
	}); 
}


module.exports.create = function(token, name, description, callback) {

	mod_db_sessions.authenticate(token, function( info ) {

		if ( info.hasError() || ! info.isActive() ) {
			callback(new CourseInfo(false, info.error)); 
			return;
		}

		var user = info.user;
		if (user.role < mod_db_users.Roles.TEACHER) {
			callback(new CourseInfo(false, 'The user <' + user.login + '> doesn\'t have permission to create a course')); 
			return; 
		} 

		mod_db.connect(function(db) {

			var cursor = db.collection(DbName).find({ name : name });
			cursor.toArray(function(err, data) {
				if (data.length == 0) {

					var course = new Course(name, user.login, description); 
					db.collection(DbName).insert(course);
					callback(new CourseInfo(true, '', course)); 

				} else {
					callback(new CourseInfo(false, 'A course with the same name <' + name + '> already exists'));
				}
			});
		});
	}); 
}


module.exports.remove = function(token, name, callback) {

	mod_db_sessions.authenticate(token, function( info ) {

		if ( info.hasError() || ! info.isActive() ) {
			callback(new CourseInfo(false, info.error)); 
			return;
		}

		var user = info.user;

		if (user.role < mod_db_users.Roles.ADMIN) {
			callback(new CourseInfo(false, 'The user <' + user.login + '> doesn\'t have permission to delete a course')); 
			return; 
		} 

		module.exports.findByName(name, function(courseInfo) {

			//
			// Si il n'y a rien ou trop d'items ça pète avant 
			//
			//
			//	Mais à part ça il faudrait vraiment renvoyer quelque chose de générique 
			//		qui puisse venir de mod_courses ou mod_users ou mod_session, qui traverse bien les callback
			//		et qui  contient un bool success, un texte message d'info ou d'erreur en fonction de success 
			//				et eventuellement un objet ou une liste à traiter 
			//		mais pas une proxy spécifique à chaque entité car ça ne permet pas d'être générique sur tous les appels vers le serveur et entre les modules du serveur 
			//
			mod_db.connect(function(db) {
				db.collection(DbName).findAndRemove({ name : courseInfo.data.name });
				callback(new CourseInfo(true, '', courseInfo.data)); 
			});

		});
	});
}


//Useful functions
/////////////////////////////////////////////////////////////////////////////////////


function dbToCourse(c) {

	var course = new Course(c.name, c.teacher, c.description); 
	return course; 
}



