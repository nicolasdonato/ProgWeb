
var mod_db_users = require('../db/users');
var mod_db_sessions = require('../db/sessions'); 
var mod_db_courses = require('../db/courses'); 
var mod_db_classes = require('../db/classes'); 


exports.setup = function(app) {
	
	// User management
	
	app.post(  '/manage/users',        mod_db_users.create);
	app.get(   '/manage/users',        mod_db_users.list);
	app.get(   '/manage/users/:id',    mod_db_users.get);
	app.put(   '/manage/users/:id',    mod_db_users.update); 
	app.delete('/manage/users/:id',    mod_db_users.remove);
	
	
	// Course management
	
	app.post(  '/manage/courses',        mod_db_courses.create);
	app.get(   '/manage/courses',        mod_db_courses.list);
	app.get(   '/manage/courses/:id',    mod_db_courses.get);
	app.put(   '/manage/courses/:id',    mod_db_courses.update); 
	app.delete('/manage/courses/:id',    mod_db_courses.remove);
	
	
	// Class management
	
	app.post(  '/manage/classes',        mod_db_classes.start);
	app.get(   '/manage/classes',        mod_db_classes.list);
	app.get(   '/manage/classes/:id',    mod_db_classes.get);
	app.put(   '/manage/classes/:id',    mod_db_classes.update); 
	app.delete('/manage/classes/:id',    mod_db_classes.end);
	
	
	// Session management

	app.post(  '/session/login',       mod_db_sessions.requestLogin); 
	app.post(  '/session/logout',      mod_db_sessions.requestLogout); 
	app.post(  '/session/join/:id',    mod_db_sessions.join); 
	app.post(  '/session/leave',       mod_db_sessions.leave); 
	
};

