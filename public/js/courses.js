window.COURSES = {


		updateCommandInProgress: false,
		deleteCommandInProgress: false,
		enrolCommandInProgress: false,
		editCommandInProgress: false,
		quitCommandInProgress: false,


		selectedCourse: null, 


		//Module management
		/////////////////////////////////////////////////////////////////////////////////////


		initialize: function() {
		},


		getSelected: function() {
			return COURSES.selectedCourse; 
		}, 


		setSelected: function(course) {
			
			$("#courses-list a").removeClass("selected-course");
			if( course != null){
				$("#courses-list a[id="+ course.id +"]").addClass("selected-course");
			}
			
			COURSES.selectedCourse = course; 
			CLASSES.list(); 
			CLASSES.refreshCreation(); 
		}, 


		// Appelée à chaque AUTH.loginAccepted()
		connect: function() {

			$("#courses-creation-form").submit(COURSES.create);

			// NB pour les 2 instructions qui suivent c'est click et pas submit car il s'agit de boutons et non d'un form
			//
			// Dans la pile des ev : le click sera déclenché avant le submit car l'input est enfant de form
			//	Il ne faut donc surtout pas preventDefautl() dans le click mais sur le form plutot via la méthode processEditionCommand
			$("#courses-edition-submit-update").click(COURSES.engageUpdateCommand);
			$("#courses-edition-submit-delete").click(COURSES.engageDeleteCommand);
			$("#courses-edition-form").submit(COURSES.processEditionCommand);

			$("#courses-details-submit-modify").click(COURSES.engageEditCommand);
			$("#courses-details-submit-enrol").click(COURSES.engageEnrolCommand);
			$("#courses-details-submit-quit").click(COURSES.engageQuitCommand);
			$("#courses-details-form").submit(COURSES.processDetailsCommand);

			//Tous les liens du container sont liés à l'action processHashLink
			$("#courses-list a, #courses-refresh").click(COURSES.processHashLink);

			// Afficher la liste des cours et le formulaire de création
			COURSES.list();
			$("#courses-div").show();
			if (AUTH.getRole() >= 2) {
				$("#courses-creation-form").show();
			} else {
				$("#courses-creation-form").hide();
			}
			$("#courses-details-form").hide();
			$("#courses-edition-form").hide();
		},


		// Appelée à chaque AUTH.logout()
		disconnect: function() {

			COURSES.clean(); 

			$("#courses-creation-form").unbind("submit", COURSES.create);

			$("#courses-edition-submit-update").unbind("click", COURSES.engageUpdateCommand);
			$("#courses-edition-submit-delete").unbind("click",COURSES.engageDeleteCommand);
			$("#courses-edition-form").unbind("submit", COURSES.processEditionCommand);

			$("#courses-details-submit-modify").unbind("click", COURSES.engageEditCommand);
			$("#courses-details-submit-enrol").unbind("click",COURSES.engageEnrolCommand);
			$("#courses-details-form").unbind("submit", COURSES.processDetailsCommand);

			$("#courses-list a, #courses-refresh").unbind("click" , COURSES.processHashLink);

			$("#courses-creation-form").hide();
			$("#courses-details-form").hide();
			$("#courses-edition-form").hide();
			$("#courses-div").hide();
		},


		refreshDetails: function() {

			$("#courses-details-id").text(COURSES.selectedCourse.id);
			$("#courses-details-name").text(COURSES.selectedCourse.name);
			$("#courses-details-teacher").text(COURSES.selectedCourse.teacher.login);
			$("#courses-details-description").text(COURSES.selectedCourse.description);

			var user = AUTH.getMember(); 
			var isStudent = false; 
			var i = 0; 
			while (! isStudent && i < COURSES.selectedCourse.students.length) {
				isStudent = (COURSES.selectedCourse.students[i] == user);
				i++;
			}

			if (isStudent) {

				$("#courses-details-submit-enrol").hide();
				$("#courses-details-submit-quit").show();

			} else {

				$("#courses-details-submit-quit").hide();
				if (user != COURSES.selectedCourse.teacher.login) {
					$("#courses-details-submit-enrol").show();
					$("#courses-details-message").hide(); 
				} else {
					$("#courses-details-submit-enrol").hide();
					$("#courses-details-message").hide(); 
				}
			}

			if (AUTH.getRole() < 3 && COURSES.selectedCourse.teacher.login != user) {
				$("#courses-details-submit-modify").hide();
			} else {
				$("#courses-details-submit-modify").show();
			}
		},


		clean: function(e, params) {
			if (e != null) {
				e.preventDefault();
			}

			COURSES.setSelected(null); 
			$("#courses-details-form").hide();
			$("#courses-edition-form").hide();
			$("#courses-edition-name").val('');
			$("#courses-edition-description").val('');
			$("#courses-list").empty();

			return false;
		},


		refresh: function(e, params) {
			if (e != null) {
				e.preventDefault();
			}

			$("#courses-details-form").hide();
			$("#courses-edition-form").hide();
			$("#courses-list").hide();

			COURSES.clean(e, params); 
			COURSES.list(e, params);
			CLASSES.refresh(); 

			$("#courses-list").show();

			return false;
		},


		// Effectué lors d'un clic sur le bouton update. 
		// Va remonter vers le form pour déclencher le submit via processEditionCommand.
		engageUpdateCommand: function(e, params) {

			COURSES.updateCommandInProgress = true;
		},


		// Effectué lors d'un clic sur le bouton delete. 
		// Va remonter vers le form pour déclencher le submit via processEditionCommand.
		engageDeleteCommand: function(e, params) {

			COURSES.deleteCommandInProgress = true;
		},


		// Effectué lors d'un clic sur le bouton update. 
		// Va remonter vers le form pour déclencher le submit via processEditionCommand.
		engageEnrolCommand: function(e, params) {

			COURSES.enrolCommandInProgress = true;
		},


		// Effectué lors d'un clic sur le bouton delete. 
		// Va remonter vers le form pour déclencher le submit via processEditionCommand.
		engageEditCommand: function(e, params) {

			COURSES.editCommandInProgress = true;
		},

		// Effectué lors d'un clic sur le bouton quit. 
		// Va remonter vers le form pour déclencher le submit via processEditionCommand.
		engageQuitCommand: function(e, params) {

			COURSES.quitCommandInProgress = true;
		},


		processHashLink: function(e) {
			if (e != null) {
				e.preventDefault();
			}

			GEOCHAT_COMPONENTS.processHashLink(e, this.hash, COURSES); 
			return false; 
		},


		//SEND functions
		/////////////////////////////////////////////////////////////////////////////////////


		//	app.get('/manage/courses', mod_db_courses.requestList);
		list: function(e, params) {
			if (e != null) {
				e.preventDefault();
			}

			var data = { token: AUTH.session.token };
			$.get("/manage/courses", data , COURSES.listComplete , "json");

			return false;
		},


		//	app.post('/manage/courses', mod_db_courses.requestCreate);
		create: function(e, params) {
			if (e != null) {
				e.preventDefault();
			}

			var data = { 
					token: AUTH.session.token,
					name: $("#courses-creation-name").val(), 
					description: $("#courses-creation-description").val() 
			};
			$.post("/manage/courses", data, COURSES.creationComplete, "json");

			return false;
		},


		//	app.get('/manage/courses/:id', mod_db_courses.requestGet);
		get: function(e, params) {
			if (e != null) {
				e.preventDefault();
			}

			if (params.id == undefined || params.id == null) {
				alert('The parameter <id> must be specified for get action'); 
			}

			var data = { token: AUTH.session.token };
			$.get("/manage/courses/" + params.id , data, COURSES.getComplete, "json");

			return false;
		},


		processEditionCommand: function(e, params) {
			if (e != null) {
				e.preventDefault();
			}

			var data = { token: AUTH.session.token };

			// app.put('/manage/courses/:id', mod_db_courses.requestUpdate); 
			if (COURSES.updateCommandInProgress) {

				data.name = $("#courses-edition-name").val();
				data.teacher = $("#courses-details-teacher").text();
				data.description = $("#courses-edition-description").val();

				$.ajax({
					type: "PUT",
					url: "/manage/courses/" + $("#courses-details-id").text(),
					data: JSON.stringify(data),
					contentType: "application/json; charset=utf-8",
					dataType: "json"
				}).done(COURSES.updateComplete);
			}

			//	app.delete('/manage/courses/teacher/:id', mod_db_courses.requestRemove);
			if (COURSES.deleteCommandInProgress) {

				$.ajax({
					type: "DELETE",
					url: "/manage/courses/teacher/" + $("#courses-details-id").text(),
					data: JSON.stringify(data),
					contentType: "application/json; charset=utf-8",
					dataType: "json"
				}).done(COURSES.deleteComplete);
			}

			COURSES.updateCommandInProgress = false;
			COURSES.deleteCommandInProgress = false;

			return false;
		},


		processDetailsCommand: function(e, params) {
			if (e != null) {
				e.preventDefault();
			}

			// app.post('/manage/courses/:id', mod_db_courses.requestEnrol); 
			if (COURSES.enrolCommandInProgress) {

				$.ajax({
					type: "POST",
					url: "/manage/courses/" + $("#courses-details-id").text(),
					data: JSON.stringify({ token: AUTH.session.token }),
					contentType: "application/json; charset=utf-8",
					dataType: "json"
				}).done(COURSES.enrolComplete);
			}

			// app.delete('/manage/courses/student/:id', mod_db_courses.requestQuit); 
			if(COURSES.quitCommandInProgress){
				$.ajax({
					type: "DELETE",
					url: "/manage/courses/student/" + $("#courses-details-id").text(),
					data: JSON.stringify({ token: AUTH.session.token }),
					contentType: "application/json; charset=utf-8",
					dataType: "json"
				}).done(COURSES.quitComplete);
			}

			if (COURSES.editCommandInProgress) {

				$("#courses-edition-name").val($("#courses-details-name").text());
				$("#courses-edition-description").val($("#courses-details-description").text());

				$("#courses-details-form").hide();
				$("#courses-edition-form").show();
			}

			COURSES.quitCommandInProgress = false;
			COURSES.enrolCommandInProgress = false;
			COURSES.editCommandInProgress = false;

			return false;
		},


		//RECEIVE functions
		/////////////////////////////////////////////////////////////////////////////////////


		creationComplete: function(info) {

			if (info.success) {
				COURSES.list();
			} else {
				alert(info.message); 
			}
		},


		deleteComplete: function(info) {

			if (info.success) {
				COURSES.list();
			} else {
				alert(info.message); 
			}

			COURSES.clean(); 
		},


		getComplete: function(info) {

			if (info.success) {

				COURSES.setSelected(info.result); 

				COURSES.refreshDetails(); 
				$("#courses-details-form").show();

			} else {
				COURSES.clean(); 
				alert(info.message); 
			}
		},


		listComplete: function(info) {

			var list = $("<ul></ul>");

			$(info.result).each(function(index, course) {

				var item = $("<li><a></a></li>");
				//	app.get('/manage/courses/:id', mod_db_courses.requestGet);
				$("a", item).attr("id", course.id).attr("href", "#get?id=" + course.id).click(COURSES.processHashLink).text(course.name);
				list.append(item);
			});

			$("#courses-list").empty().append(list);
		},


		enrolComplete: function(info) {

			if (info.success) {

				COURSES.setSelected(info.result);

				COURSES.refreshDetails(); 

			} else {
				alert(info.message); 
			}
		},


		quitComplete: function(info) {

			if (info.success) {

				COURSES.setSelected(info.result);

				COURSES.refreshDetails(); 

			} else {
				alert(info.message); 
			}
		},


		updateComplete: function(info) {

			if (info.success) {

				COURSES.setSelected(info.result); 

				COURSES.list();

				$("#courses-details-name").val(COURSES.selectedCourse.name);
				$("#courses-details-teacher").val(COURSES.selectedCourse.teacher.login);
				$("#courses-details-description").val(COURSES.selectedCourse.description);

				$("#courses-edition-form").hide();		
				$("#courses-details-form").hide();

			} else {
				alert(info.message); 
			}
		}

};
