
//Imports and constants
/////////////////////////////////////////////////////////////////////////////////////


var mod_db = require('./manager');
var mod_db_sessions = require('./sessions'); 
var mod_db_users = require('./users'); 
var mod_utils = require('../utils'); 
var logger = require('../logger'); 

var DbName = 'repository'; 


//Template of document 'Course' in database
RepositoryFile = function(user, filename, originalFilename) {

	this.id = mod_utils.idGen.get(); 

	// Mandatory information
	this.user = user;
	this.filename = filename; 
	this.originalFilename = originalFilename; 
	
}


function RepositoryFileInfo(success, message, data) {

	mod_db.ServerInfo.call(this, success, message, data); 

	this.update = function(callback) {

		if (this.result == undefined || this.result == null) {
			callback(this); 
		} else if (this.result instanceof Array) {
			// TODO
			callback(this); 
		} else {
			dbToRepositoryFile(this, this.result, function(that, repositoryFile) {
				that.result = repositoryFile; 
				callback(that); 
			}); 
		}
	}
}

RepositoryFileInfo.prototype = mod_db.ServerInfo; 

var makeRepositoryFileInfo = function(success, message, data, callback) {

	var repositoryFile = new RepositoryFileInfo(success, message, data); 
	repositoryFile.update(callback); 
};

module.exports.requestUpload = function(req, res){
	
	if(!req.sessionInfo.user == undefined || req.sessionInfo.token == undefined){
		res.send(new RepositoryFileInfo(false, 'Unknown session'));
	}

	var files = req.files;

	if(files.file == undefined){
		res.send(new RepositoryFileInfo(false, 'Failed to read file from stream'));
	}
	else {
		var file = files.file;
		/*
		 * A multer file object is a JSON object with the following properties.
		
		fieldname - Field name specified in the form
		originalname - Name of the file on the user's computer
		name - Renamed file name
		encoding - Encoding type of the file
		mimetype - Mime type of the file
		path - Location of the uploaded file
		extension - Extension of the file
		size - Size of the file in bytes
		truncated - If the file was truncated due to size limitation
		buffer - Raw data (is null unless the inMemory option is true)*/
		module.exports.create(req, file, function(info) {
			res.send(info); 
		}); 
	}
	//
	// on peut ajouter des élements à la session ( != session db) c'est un objet rattaché à la request qui permet de faire circuler des variables
	//
	//req.session.token = req.param('token');
};

module.exports.FileUploadStart = function(file){

};

module.exports.FileUploadComplete = function(file){

};


//Local API
/////////////////////////////////////////////////////////////////////////////////////


module.exports.getCollectionName = function() {
	return DbName; 
};


module.exports.initialize = function(db) {

	/*var web_srv = new Course('web_srv', 'peter', 'Programmation Web côté Serveur'); 
	var web_cli = new Course('web_cli', 'michel', 'Programmation Web côté Client'); 
	var web_sem = new Course('web_sem', 'peter', 'Web Sémantique'); 

	var initializationData = [web_srv, web_cli, web_sem];

	var collection = db.collection(DbName);
	for (var index in initializationData) {
		collection.insert(initializationData[index]); 
	}*/
};


module.exports.find = function(file, callback) {

	mod_db.find(DbName, { filename: file.name }, function(result) {

		if (result.length == 0) {
			logger.out('No file named <' + file.name + '> found')
			callback(new RepositoryFileInfo(false, 'File <' + file.name + '> unknown')); 
			return;
		} else if (result.length > 1) {
			throw new Error('More than one file with the same name were found');
		}

		makeRepositoryFileInfo(true, '', result[0], callback); 
	});
};


module.exports.findById = function(id, callback) {

	mod_db.find(DbName, { id: +id }, function(result) {

		if (result.length == 0) {
			logger.out('No file #' + id + ' found')
			callback(new RepositoryFileInfo(false, 'File #' + id + ' unknown')); 
			return;
		} else if (result.length > 1) {
			throw new Error('More than one file with the same ID were found');
		}

		makeRepositoryFileInfo(true, '', result[0], callback); 
	});
};


//module.exports.get = function(id, callback) {
//
//	module.exports.findById(id, function(courseInfo) {
//		callback(courseInfo); 
//	}); 
//};
//

module.exports.list = function(callback) {

	var user = req.sessionInfo.user;
	
	mod_db.find(DbName, { }, function(result) {

		makeRepositoryFileInfo(true, '', result, callback); 
	});
};


module.exports.create = function(req, file, callback) {
	/*if (user.role < mod_db_users.Roles.TEACHER) {
		callback(new CourseInfo(false, 'The user <' + user.login + '> doesn\'t have permission to create a course')); 
		return; 
	} 

	if (name == '') {
		callback(new CourseInfo(false, 'Failed to create course : empty name')); 
		return;
	}*/

	module.exports.find(file, function(repositoryFileInfo) {
		
		var user = req.sessionInfo.user;
		var filename = file.name;
		var originalFilename = file.originalname;
		
		if (repositoryFileInfo.success) {
			callback(new RepositoryFileInfo(false, 'Failed to create a file: A file with the same name <' + filename + '> already exists'));
		} else {
			var repositoryFile = new RepositoryFile(user.login, filename, originalFilename); 
			mod_db.insert(DbName, repositoryFile); 
			makeRepositoryFileInfo(true, '', repositoryFile, callback); 
		}
	}); 
};


//module.exports.remove = function(user, id, callback) {
//
//	if (user.role < mod_db_users.Roles.TEACHER) {
//		callback(new CourseInfo(false, 'The user <' + user.login + '> doesn\'t have permission to delete a course')); 
//		return; 
//	} 
//


//Useful functions
/////////////////////////////////////////////////////////////////////////////////////


function dbToRepositoryFile(that, rf, callback) {

	if (typeof rf.user == 'string') {

		mod_db_users.get(rf.user , function(userInfo) {

			if (userInfo == null) {
				throw new Error('User info is null'); 
			} else if (! userInfo.success) {
				throw new Error('There should be a user <' + rf.user + '> in DB'); 
			}

			var repositoryFile = new RepositoryFile(userInfo.result, rf.filename, rf.originalFilename); 
			repositoryFile.id = rf.id; 
			callback(that, repositoryFile); 
		}); 

	} else {
		var repositoryFile = new RepositoryFile(rf.user, rf.filename, rf.originalFilename); 
		repositoryFile.id = rf.id; 
		callback(that, repositoryFile); 
	}

}
