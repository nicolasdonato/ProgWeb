
var mod_db_users = require('../db/users');
var mod_db_sessions = require('../db/sessions'); 
var mod_db_courses = require('../db/courses'); 
var mod_db_classes = require('../db/classes'); 


exports.setup = function(app) {

	
	// User management

	app.route('/manage/users').
	post(mod_db_users.requestCreate).
	get(mod_db_users.requestList);

	app.route('/manage/users/:id').
	get(mod_db_users.requestGet).
	put(mod_db_users.requestUpdate).
	delete(mod_db_users.requestRemove);	

	
	// Course management

	app.route('/manage/courses').
	post(mod_db_courses.requestCreate).
	get(mod_db_courses.requestList);

	app.route('/manage/courses/:id').
	get(mod_db_courses.requestGet).
	post(mod_db_courses.requestEnrol).
	put(mod_db_courses.requestUpdate);

	app.route('/manage/courses/teacher/:id').
			delete(mod_db_courses.requestRemove);
			
	app.route('/manage/courses/student/:id').
			delete(mod_db_courses.requestQuit);

	
	// Class management

	app.route('/manage/classes').
	post(mod_db_classes.requestStart).
	get(mod_db_classes.requestList);

	app.route('/manage/classes/:id').
	get(mod_db_classes.requestGet).
	put(mod_db_classes.requestUpdate).
	delete(mod_db_classes.requestEnd);


	// Session management

	app.route('/session/login').
	post(mod_db_sessions.requestLogin);
	app.route('/session/logout').
	post(mod_db_sessions.requestLogout);
	app.route('/session/join/:id').
	post(mod_db_sessions.requestJoin);
	app.route('/session/leave').
	post(mod_db_sessions.requestLeave);

};

