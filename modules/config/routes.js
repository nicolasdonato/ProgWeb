
var mod_db_users = require('../db/users');
var mod_db_sessions = require('../db/sessions'); 
var mod_db_courses = require('../db/courses'); 
var mod_db_classes = require('../db/classes'); 

var cors = require('cors');


exports.setup = function(app) {
	
	// User management
	
	app.post(  '/manage/users',        mod_db_users.create);
	app.get(   '/manage/users',        mod_db_users.list);
	app.get(   '/manage/users/:id',    mod_db_users.get);
	app.put(   '/manage/users/:id',    mod_db_users.update); 
	app.delete('/manage/users/:id',    mod_db_users.remove);
	
	
	// Course management
	
	app.post(  '/manage/courses',        mod_db_courses.createRequest);
	app.get(   '/manage/courses',        mod_db_courses.listRequest);
	app.get(   '/manage/courses/:id',    mod_db_courses.getRequest);
	app.put(   '/manage/courses/:id',    mod_db_courses.updateRequest); 
	app.delete('/manage/courses/:id',    mod_db_courses.removeRequest);
	
	
	// Class management
	
	app.post(  '/manage/classes',        mod_db_classes.start);
	app.get(   '/manage/classes',        mod_db_classes.list);
	app.get(   '/manage/classes/:id',    mod_db_classes.get);
	app.put(   '/manage/classes/:id',    mod_db_classes.update); 
	app.delete('/manage/classes/:id',    mod_db_classes.end);
	
	
	// Session management

	app.post(  '/session/login',       mod_db_sessions.requestLogin); 
	app.post(  '/session/logout',      mod_db_sessions.requestLogout); 
	app.post(  '/session/join/:id',    mod_db_sessions.requestJoin); 
	app.post(  '/session/leave',       mod_db_sessions.requestLeave); 
	
};

