
var mod_db_users = require('../db/users');
var mod_db_sessions = require('../db/sessions'); 
var mod_db_courses = require('../db/courses'); 
var mod_db_classes = require('../db/classes'); 

exports.setup = function(app) {

	// User management

	app.route('/manage/users').
	post(mod_db_users.create).
	get(mod_db_users.list);

	app.route('/manage/users/:id').
	get(mod_db_users.get).
	put(mod_db_users.update).
	delete(mod_db_users.remove);	

	// Course management

	app.route('/manage/courses').
	post(mod_db_courses.createRequest).
	get(mod_db_courses.listRequest);

	app.route('/manage/courses/:id').
	get(mod_db_courses.getRequest).
	post(mod_db_courses.enrolRequest).
	put(mod_db_courses.updateRequest);

	app.route('/manage/courses/teacher/:id').
			delete(mod_db_courses.removeRequest);
			
	app.route('/manage/courses/student/:id').
			delete(mod_db_courses.quitRequest);

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

