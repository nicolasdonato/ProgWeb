window.COURSES = {


		//Module management
		/////////////////////////////////////////////////////////////////////////////////////


		updateCommandInProgress: false,

		deleteCommandInProgress: false,


		// Appelée à chaque AUTH.loginAccepted()
		initialize: function() {

			$("#courses-creation-form").submit(COURSES.create);
			$("#courses-details-form").submit(COURSES.edit);

			// NB pour les 2 instructions qui suivent c'est click et pas submit car il s'agit de boutons et non d'un form
			//
			// Dans la pile des ev : le click sera déclenché avant le submit car l'input est enfant de form
			//	Il ne faut donc surtout pas preventDefautl() dans le click mais sur le form plutot via la méthode processEditionCommand
			$("#courses-edition-submit-update").click(COURSES.engageUpdateCommand);
			$("#courses-edition-submit-delete").click(COURSES.engageDeleteCommand);
			$("#courses-edition-form").submit(COURSES.processEditionCommand);

			//Tous les liens du container sont liés à l'action processHashLink
			$("#courses-list a, #courses-refresh").click(COURSES.processHashLink);

			// Afficher la liste des cours et le formulaire de création
			COURSES.list();
			$("#courses-div").show();
			$("#courses-creation-form").show();
			$("#courses-details-form").hide();
			$("#courses-edition-form").hide();
		},


		// Appelée à chaque AUTH.logout()
		disconnect: function() {

			// Cette fonction fait l'inverse de la configuration de initialize() lors d'un logOut() pour que le initialize() 
			// qui se fera ensuite parte sur des bases propres

			$("#courses-creation-form").unbind("submit", COURSES.create);
			$("#courses-details-form").unbind("submit", COURSES.edit);
			$("#courses-edition-submit-update").unbind("click", COURSES.engageUpdateCommand);
			$("#courses-edition-submit-delete").unbind("click",COURSES.engageDeleteCommand);
			$("#courses-edition-form").unbind("submit", COURSES.processEditionCommand);
			$("#courses-list a, #courses-refresh").unbind("click" , COURSES.processHashLink);

			$("#courses-creation-form").hide();
			$("#courses-details-form").hide();
			$("#courses-edition-form").hide();
			$("#courses-div").hide();
		},


		clean: function(e, params) {
			if (e != null) {
				e.preventDefault();
			}

			$("#courses-list").empty();

			return false;
		},


		refresh: function(e, params) {
			if (e != null) {
				e.preventDefault();
			}

			COURSES.list(e, params);

			return false;
		},


		edit: function(e, params) {
			if (e != null) {
				e.preventDefault();
			}

			$("#courses-edition-name").val($("#courses-details-name").text());
			$("#courses-edition-description").val($("#courses-details-description").text());

			$("#courses-details-form").hide();
			$("#courses-edition-form").show();

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


		processHashLink: function(e) {
			if (e != null) {
				e.preventDefault();
			}

			try {

				var questionIndex = this.hash.indexOf('?'); 

				var action = '';
				var params = {};
				if (questionIndex > -1) {

					action = this.hash.substr(1, questionIndex - 1);
					if (action == '') {
						throw new Error('Bad format #0 of hash link <' + this.hash + '>');
					}

					var parameters = this.hash.substr(questionIndex + 1);
					if (parameters == '') {
						throw new Error('Bad format #1 of hash link <' + this.hash + '>');
					}

					var ampersand = -1; 
					do {

						ampersand = parameters.indexOf('&'); 
						if (ampersand > -1) {

							var parameter = parameters.substr(0, ampersand); 
							var equalIndex = parameter.indexOf('=');
							if (equalIndex < 0) {
								throw new Error('Bad format #2 of hash link <' + this.hash + '>'); 
							}
							var param = parameter.substr(0, equalIndex); 
							var value = parameter.substr(equalIndex + 1); 
							if (param == '' || value == '') {
								throw new Error('Bad format #3 of hash link <' + this.hash + '>'); 
							}
							params[param] = value; 

							parameters = parameters.substr(ampersand + 1); 

						} else {

							var parameter = parameters; 
							var equalIndex = parameter.indexOf('=');
							if (equalIndex < 0) {
								throw new Error('Bad format #4 of hash link <' + this.hash + '>'); 
							}
							var param = parameter.substr(0, equalIndex); 
							var value = parameter.substr(equalIndex + 1); 
							if (param == '' || value == '') {
								throw new Error('Bad format #5 of hash link <' + this.hash + '>'); 
							}
							params[param] = value; 
						}

					} while(ampersand > -1); 

				} else {
					action = this.hash.substr(1); 
				}

				if (COURSES[action] == undefined || COURSES[action] == null) {
					alert('The action <' + action + '> is unknown'); 
					return false; 
				}

				COURSES[action](e, params); 
				return false;

			} catch (err) {

				alert(err.message); 
				return false;
			}
		},


		//SEND functions
		/////////////////////////////////////////////////////////////////////////////////////


		//	app.get('/manage/courses', mod_db_courses.listRequest);
		list: function(e, params) {
			if (e != null) {
				e.preventDefault();
			}

			var data = { token: AUTH.session.token };
			$.get("/manage/courses", data , COURSES.listComplete , "json");

			return false;
		},


		//	app.post('/manage/courses', mod_db_courses.createRequest);
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


		//	app.get('/manage/courses/:id', mod_db_courses.getRequest);
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

			if (COURSES.updateCommandInProgress) {

				data.name = $("#courses-edition-name").val();
				data.teacher = $("#courses-details-teacher").text();
				data.description = $("#courses-edition-description").val();

				// app.put('/manage/courses/:id', mod_db_courses.updateRequest); 
				$.ajax({
					type: "PUT",
					url: "/manage/courses/" + $("#courses-details-id").text(),
					data: JSON.stringify(data),
					contentType: "application/json; charset=utf-8",
					dataType: "json"
				}).done(COURSES.updateComplete);
			}

			if (COURSES.deleteCommandInProgress) {

				//	app.delete('/manage/courses/:id', mod_db_courses.removeRequest);
				$.ajax({
					type: "DELETE",
					url: "/manage/courses/" + $("#courses-details-id").text(),
					data: JSON.stringify(data),
					contentType: "application/json; charset=utf-8",
					dataType: "json"
				}).done(COURSES.deleteComplete);
			}

			COURSES.updateCommandInProgress = false;
			COURSES.deleteCommandInProgress = false;

			return false;
		},


		//RECEIVE functions
		/////////////////////////////////////////////////////////////////////////////////////


		creationComplete: function(info) {

			if (info.success) {
				COURSES.list();
			} else {
				$("#courses-info").text('');
				alert(info.message); 
			}
		},


		deleteComplete: function(info) {

			if (info.success) {
				COURSES.list();
			} else {
				$("#courses-info").text('');
				alert(info.message); 
			}

			$("#courses-details-form").hide();
			$("#courses-edition-form").hide();
		},


		getComplete: function(info) {

			if (info.success) {
				$("#courses-details-id").text(info.result.id);
				$("#courses-details-name").text(info.result.name);
				$("#courses-details-teacher").text(info.result.teacher.login);
				$("#courses-details-description").text(info.result.description);
				$("#courses-details-form").show();
				$("#courses-edition-form").hide();
			} else {
				$("#courses-info").text('');
				$("#courses-details-form").hide();
				$("#courses-edition-form").hide();
				alert(info.message); 
			}
		},


		listComplete: function(info) {

			var list = $("<ul></ul>");

			$(info.result).each(function(index, course) {

				var item = $("<li><a></a></li>");
				$("a", item).attr("href", "#get?id=" + course.id).click(COURSES.processHashLink).text(course.name);
				list.append(item);
			});

			$("#courses-list").empty().append(list);
		},


		updateComplete: function(info) {

			if (info.success) {

				COURSES.list();

				$("#courses-details-name").val(info.result.name);
				$("#courses-details-teacher").val(info.result.teacher.login);
				$("#courses-details-description").val(info.result.description);

				$("#courses-edition-form").hide();		
				$("#courses-details-form").hide();

			} else {
				alert(info.message); 
			}
		}

};
