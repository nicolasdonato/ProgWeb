
var mod_db_users = require('../db/users');
var mod_db_sessions = require('../db/sessions'); 
var mod_db_courses = require('../db/courses'); 
var mod_db_classes = require('../db/classes'); 
var mod_db_repo = require('../db/repository'); 


exports.setup = function(app) {

	
	app.param('token', mod_db_sessions.requestTokenValidation);
	
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
	subscribe(mod_db_courses.requestEnrol).
	unsubscribe(mod_db_courses.requestQuit).//post(mod_db_courses.requestEnrol).
	put(mod_db_courses.requestUpdate).
	delete(mod_db_courses.requestRemove);

//	app.route('/manage/courses/teacher/:id').
//			delete(mod_db_courses.requestRemove);
//			
//	app.route('/manage/courses/student/:id').
//			delete(mod_db_courses.requestQuit);

	// Classroom management

	app.route('/manage/classes').
	get(mod_db_classes.requestList);

	app.route('/manage/classes/:id').
	get(mod_db_classes.requestGet);

	app.route('/manage/classes/teacher').
	post(mod_db_classes.requestCreate);
	app.route('/manage/classes/teacher/:id').
	put(mod_db_classes.requestUpdate).
	delete(mod_db_classes.requestEnd);

	app.route('/manage/classes/student/:id').
	post(mod_db_classes.requestJoin).
	delete(mod_db_classes.requestLeave);


	// Session management

	app.route('/session/login').
	post(mod_db_sessions.requestLogin);
	app.route('/session/logout').
	post(mod_db_sessions.requestLogout);


	// Repository management

	app.route('/:token/repository').
	post(mod_db_repo.requestUpload).
	search(mod_db_repo.requestSearch);
};

