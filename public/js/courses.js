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


		clean: function() {

			$("#courses-list").empty();
		},


		edit: function(e) {

			$("#courses-edition-name").val($("#courses-details-name").text());
			$("#courses-edition-description").val($("#courses-details-description").text());

			$("#courses-details-form").hide();
			$("#courses-edition-form").show();

			e.preventDefault();
			return false;
		},


		// Effectué lors d'un clic sur le bouton update. 
		// Va remonter vers le form pour déclencher le submit via processEditionCommand.
		engageUpdateCommand: function(e) {

			COURSES.updateCommandInProgress = true;
		},


		// Effectué lors d'un clic sur le bouton delete. 
		// Va remonter vers le form pour déclencher le submit via processEditionCommand.
		engageDeleteCommand: function(e) {

			COURSES.deleteCommandInProgress = true;
		},


		processHashLink: function(e) {

			var action = '';
			if (this.hash.indexOf("=") > -1) {
				action = this.hash.substring(0, this.hash.indexOf("="));
			}

			var param = '';
			if (this.hash.indexOf("=") > -1) {
				param = this.hash.substr(this.hash.indexOf("=") + 1 , this.hash.length - this.hash.indexOf("="));
			}

			switch(action) {

			case "#refresh":
				COURSES.list(e);
				break;

			case "#course":
				COURSES.get(param);
				break;

			default:
				alert('The action <' + action + '> is unknown'); 
			}

			e.preventDefault();
			return false;
		},


		//SEND functions
		/////////////////////////////////////////////////////////////////////////////////////


		//	app.get('/manage/courses', mod_db_courses.listRequest);
		list: function(e) {

			var data = { token: AUTH.session.token };
			$.get("/manage/courses", data , COURSES.listComplete , "json");
		},


		//	app.post('/manage/courses', mod_db_courses.createRequest);
		create: function(e) {

			var data = { 
					token: AUTH.session.token,
					name: $("#courses-creation-name").val(), 
					description: $("#courses-creation-description").val() 
			};
			$.post("/manage/courses", data, COURSES.creationComplete, "json");

			e.preventDefault();
			return false;
		},


		//	app.get('/manage/courses/:id', mod_db_courses.getRequest);
		get: function(id) {

			var data = { token: AUTH.session.token };
			$.get("/manage/courses/" + id , data, COURSES.getComplete, "json");
		},


		processEditionCommand: function(e) {

			var data = { token: AUTH.session.token };

			if (COURSES.updateCommandInProgress) {

				data.name = $("#courses-details-name").text();
				data.teacher = $("#courses-details-teacher").text();
				data.description = $("#courses-details-description").text();

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

			e.preventDefault();
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
				$("#courses-details-teacher").text(info.result.teacher);
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
				$("a", item).attr("href","#course=" + course.id).click(COURSES.processHashLink).text(course.name);
				list.append(item);
			});

			$("#courses-list").empty().append(list);
		},


		updateComplete: function(info) {

			if (info.success) {

				COURSES.list();

				$("#courses-details-name").val(info.result.name);
				$("#courses-details-teacher").val(info.result.teacher);
				$("#courses-details-description").val(info.result.description);

				$("#courses-edition-form").hide();		
				$("#courses-details-form").show();

			} else {
				alert(info.message); 
			}
		}

};
