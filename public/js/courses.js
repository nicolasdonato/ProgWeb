window.COURSES = {


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


		creationComplete: function(data) {

			if (data.success) {
				COURSES.list();
			} else {
				$("#courses-info").text(data.message);
			}
		},


		deleteComplete: function(data) {

			if (data.success) {
				COURSES.list();
			} else {
				$("#courses-info").text(data.message);
			}

			$("#courses-details-form").hide();
			$("#courses-edition-form").hide();
		},


		// Pas d'action serveur : afficher le formulaire et remplir les inputs
		edit: function(e) {

			$("#courses-edition-name").val($("#courses-details-name").text());
			$("#courses-edition-description").val($("#courses-details-description").text());

			// TO IMPLEMENT teacher list :
			//		sous forme de <select><option value="idItem">Label</option></select> 
			//		$("#courses-edition-teacher").val(data.course.teacher)
			// sauf si ça reste Readonly...

			$("#courses-details-form").hide();
			$("#courses-edition-form").show();

			e.preventDefault();
			return false;
		},


		// Effectué lors d'un clic sur le bouton update : va remonter vers le form pour déclencher le submit via processEditionCommand
		engageUpdateCommand: function(e) {

			COURSES.updateCommandInProgress = true;
		},


		// Effectué lors d'un clic sur le bouton delete : va remonter vers le form pour déclencher le submit via processEditionCommand
		engageDeleteCommand: function(e) {

			COURSES.deleteCommandInProgress = true;
		},


		//	app.get('/manage/courses/:id', mod_db_courses.getRequest);
		get: function(name) {

			var data = { token: AUTH.session.token };
			$.get("/manage/courses/" + name , data, COURSES.getComplete, "json");
		},


		getComplete: function(data) {

			if (data.success) {
				$("#courses-details-name").text(data.result.name);
				$("#courses-details-teacher").text(data.result.teacher);
				$("#courses-details-description").text(data.result.description);
				$("#courses-details-form").show();
				$("#courses-edition-form").hide();
			} else {
				$("#courses-info").text(data.message);
				$("#courses-details-form").hide();
				$("#courses-edition-form").hide();
			}
		},


		//	app.get('/manage/courses', mod_db_courses.listRequest);
		list: function(e) {

			var data = { token: AUTH.session.token };
			$.get("/manage/courses", data , COURSES.listComplete , "json");
		},


		listComplete: function(data) {

			var list = $("<ul></ul>");

			$(data.result).each(function(index, course) {

				var item = $("<li><a></a></li>");
				$("a", item).attr("href","#course=" + course.name).click(COURSES.processHashLink).text(course.name);
				list.append(item);
			});

			$("#courses-list").empty().append(list);
		},


		updateComplete: function(data) {

			// TODO
			alert("TODO")
		},


		processHashLink: function(e) {

			var hash = this.hash;
			if (hash.indexOf("=") > -1) {
				hash = hash.substring(0, hash.indexOf("="));
			}

			switch(hash) {

			case "#refresh":
				COURSES.list(e);
				break;

			case "#course":
				var name = this.hash;
				name = name.substr(name.indexOf("=") + 1 , name.length - name.indexOf("="));
				COURSES.get(name);
				break;

			default:
				alert('The action <' + hash + '> is unknown'); 
			}

			e.preventDefault();
			return false;
		},

		
		processEditionCommand: function(e) {

			var data = { token: AUTH.session.token };

			/*
			 * TODO Il y a un problème à identifier le cours avec son nom vu que le client peut le modifier
			 * On a besoin de son id interne, il doit être transmis et stocké le temps de l'édition
			 * 
			 */

			if (COURSES.updateCommandInProgress) {
				
				data.name = $("#courses-details-name").text();

				// app.put(   '/manage/courses/:id', mod_db_courses.updateRequest); 
				$.ajax({
					type: "PUT",
					url: "/manage/courses/" + $("#courses-details-name").text(),
					data: JSON.stringify(data),
					contentType: "application/json; charset=utf-8",
					dataType: "json"
				}).done(COURSES.updateComplete);
			}

			if (COURSES.deleteCommandInProgress) {

				//	app.delete('/manage/courses/:id', mod_db_courses.removeRequest);
				$.ajax({
					type: "DELETE",
					url: "/manage/courses/" + $("#courses-details-name").text(),
					data: JSON.stringify(data),
					contentType: "application/json; charset=utf-8",
					dataType: "json"
				}).done(COURSES.deleteComplete);
			}
			
			COURSES.updateCommandInProgress = false;
			COURSES.deleteCommandInProgress = false;

			e.preventDefault();
			return false;
		}

};
