
//Imports and constants
/////////////////////////////////////////////////////////////////////////////////////

var fs = require('fs'); 
var path = require('path');

/*
 * This entity manage files, provided by express module : multer
 * 
 * A multer file object is a JSON object with the following properties :
 * 
		fieldname - Field name specified in the form
		originalname - Name of the file on the user's computer
		name - Renamed file name
		encoding - Encoding type of the file
		mimetype - Mime type of the file
		path - Location of the uploaded file
		extension - Extension of the file
		size - Size of the file in bytes
		truncated - If the file was truncated due to size limitation
		buffer - Raw data (is null unless the inMemory option is true)
 * 
 * */

var mod_db = require('./manager');
var mod_db_sessions = require('./sessions'); 
var mod_db_users = require('./users'); 
var mod_utils = require('../utils'); 
var logger = require('../logger'); 

var DbName = 'repository'; 

var UploadDirectory = './uploads/';
//Template of document 'Course' in database
RepositoryFile = function(user, filename, originalFilename) {

	this.id = mod_utils.idGen.get(); 

	// Mandatory information
	this.owner = user;
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
			var resultCollection = this.result;
			this.result = [];
			
			var loader = function(it, element, innerCallback){

				dbToRepositoryFile(it, element, function(that, repositoryFile) {
					
					that.result.push(repositoryFile); 

					if(innerCallback != null){
						innerCallback(that); 
					}
				}); 
				
			};
			
			var loaderList = [];

			var that = this;
			
			loaderList.push(function(){
				callback(that);
			});
			
			resultCollection.forEach(function(element , index, array){

				var lastLoader = loaderList[ loaderList.length - 1 ];
				
				loaderList.push(function(){
					loader(that, element, lastLoader);
				});
				
			});
			

	    	if(loaderList.length == 0){
		    	throw new Error('Callback sequence malfunction');
	    	}
	    	else if(loaderList.length == 1){
	    		callback(this);
	    	}
	    	else{
		    	loaderList[loaderList.length - 1]();
	    	}
			
			//callback(this); 
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

var CheckSessionInfo = function(req, res, next){
	if(!req.sessionInfo.user == undefined || req.sessionInfo.token == undefined){
		res.send(new RepositoryFileInfo(false, 'Unknown session'));
	}
	else{
		next(req, res);
	}
};


module.exports.requestUpload = function(req, res){
	
	CheckSessionInfo(req, res, function(req, res){
		var files = req.files;

		if(files.file == undefined){
			res.send(new RepositoryFileInfo(false, 'Failed to read file from stream'));
		}
		else {
			var file = files.file;
			module.exports.create(req, req.sessionInfo.user , file, function(info) {
				//
				// Le client envoie dans le form la valeur localId qui doit lui être renvoyée pour savoir quel fichier est traité si il en a envoyé plusieurs
				//
				info.localId = req.body.localId;
				res.send(info); 
			}); 
		}
	})
	//
	// on peut ajouter des élements à la session ( != session db) c'est un objet rattaché à la request qui permet de faire circuler des variables
	//
	//req.session.token = req.param('token');
};


module.exports.UploadDirectory = UploadDirectory; 

module.exports.requestSearch = function(req, res){

	CheckSessionInfo(req, res, function(req, res){
// 
//
//		module.exports.list(function(infos) {
//		res.send(infos); 
//	}); 
		module.exports.search( req.sessionInfo.user.login , function(infos) {
			res.send(infos); 
		}); 
	})
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
	
	/*var searchAdmin = function(callback){
		db.collection(mod_db_users.getCollectionName()).
		find({ login : "admin"}).
		toArray(function(err, results){
			assert.equal(err, null, ' Admin user could not be found...');
			assert.equal(results.length, 1 , ' There could be only one !');
			callback(results[0]);
		});
	};
	
	var collection = db.collection(DbName);
	fs.readdir(module.exports.UploadDirectory, function(err, files){
		
		assert.equal(err, null, 'Initial directory listing failed : ' + err.message);

		var fileInserts = [];
		
		var adminUser = null;
		
		var loader = function(user, fileName , callback){
			module.exports.search(  'filename' , searchedFile , function(infos) {
				
				if(! infos.sucess)
				{
					module.exports.create(null, user , searchedFile, function(){
						if(callback != null) {
							callback( user );
						}
					});
				}
				
			}); 
	    };
		
		files.forEach(function( element, index , array ){
			
			var filePath = path.combine( module.exports.UploadDirectory , element );

		    	if (fileInserts.length == 0) {
		    		fileInserts.push(function() {
		    			loader();
			    	});
		    	}
	    		var lastInsert = fileInserts[ fileInserts.length - 1 ];
	    		fileInserts.push(function( user ) {
	    			loader(user, filePath, lastInsert);
		    	});		    
		});

		
		fileInserts.push(searchAdmin);

    	if(fileInserts.length == 0){
	    	console.log('No matching file between DB and file system');
    	}
    	else{
        	fileInserts[ fileInserts.length - 1 ]();
    	}
	});*/
	
	
	
	
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

	mod_db.find(DbName, { }, function(result) {

		makeRepositoryFileInfo(true, '', result, callback); 
	});
};

module.exports.search = function( user, callback) {

	mod_db.find(DbName, { owner : user }, function(result) {

		makeRepositoryFileInfo(true, '', result, callback); 
	});
};


module.exports.create = function(req, user , file, callback) {
	/*if (user.role < mod_db_users.Roles.TEACHER) {
		callback(new CourseInfo(false, 'The user <' + user.login + '> doesn\'t have permission to create a course')); 
		return; 
	} 

	if (name == '') {
		callback(new CourseInfo(false, 'Failed to create course : empty name')); 
		return;
	}*/

	module.exports.find(file, function(repositoryFileInfo) {
		
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

	if (typeof rf.owner == 'string') {

		mod_db_users.get(rf.owner , function(userInfo) {

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
		var repositoryFile = new RepositoryFile(rf.owner, rf.filename, rf.originalFilename); 
		repositoryFile.id = rf.id; 
		callback(that, repositoryFile); 
	}

}
