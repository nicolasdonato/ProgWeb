window.CLASSES = {


		startCommandInProgress: false, 
		endCommandInProgress: false, 
		joinCommandInProgress: false, 
		leaveCommandInProgress: false, 


		selectedClasse : null, 


		//Module management
		/////////////////////////////////////////////////////////////////////////////////////


		initialize: function() {

			// On ne peut pas écrire ou coller dans ces boutons
			$("#classes-creation-startDate, #classes-creation-startHour, #classes-creation-duration").keypress(function(e) { e.preventDefault(); return false;});
			$("#classes-creation-startDate, #classes-creation-startHour, #classes-creation-duration").bind('paste', function(e) { e.preventDefault(); return false;});

			// voir http://jqueryui.com/datepicker/#date-range
			$("#classes-creation-startDate").datepicker({
				format : 'dd/mm/yyyy'
			});
			//voir options : https://jonthornton.github.io/jquery-timepicker/
			$('#classes-creation-startHour').timepicker({ 
				timeFormat: 'H:i',
				//showDuration: true,
				//useSelect: true ,
				scrollDefault: 'now' });
			$('#classes-creation-duration').timepicker({ 
				timeFormat: 'H:i',
				showDuration: true,
				//useSelect: true ,
				scrollDefault: '1:00' });

			$("#classes-creation-form input[name=classes-creation-start-when]").click(function(e){

				//activer / desactiver la saisie de la date en fonction du radio sélectionné
				switch($(e.target).val()){

				case "NOW":
					$("#classes-creation-startDate").val("");
					$("#classes-creation-startHour").val("");
					$("#classes-creation-duration").val("");
					$("#classes-creation-startDate").attr('disabled','disabled');
					$("#classes-creation-startHour").attr('disabled','disabled');
					$("#classes-creation-duration").attr('disabled','disabled');
					break;

				case "DELAY":
					$("#classes-creation-startDate").removeAttr('disabled');
					$('#classes-creation-startDate').datepicker('setDate', new Date()); 
					$("#classes-creation-startHour").removeAttr('disabled');
					$('#classes-creation-startHour').timepicker('setTime', new Date()); 
					$("#classes-creation-duration").removeAttr('disabled');
					break;
				}
			});

			// au chargement c'est l'option démarrage immédiat qui est sélectionnée
			$("#classes-creation-startNow").click();
		},


		getSelected: function() {
			return CLASSES.selectedClasse; 
		}, 


		setSelected: function(classe) {

			$("#classes-list a").removeClass("selected-classe");
			if (classe != null) {
				$("#classes-list a[id="+ classe.id +"]").addClass("selected-classe");
				$("#classes-details-form").show();
			} else {
				$("#classes-details-form").hide();
			}

			CLASSES.selectedClasse = classe; 
			CLASSES.refreshDetails(); 
		}, 


		connect: function() {

			$("#classes-list a").click(CLASSES.processHashLink);

			$("#classes-creation-form").submit(CLASSES.create);

			$("#classes-details-form input[type=submit]").hide();
			$("#classes-details-submit-start").click(CLASSES.engageStartCommand);
			$("#classes-details-submit-end").click(CLASSES.engageEndCommand);
			$("#classes-details-submit-join").click(CLASSES.engageJoinCommand);
			$("#classes-details-submit-leave").click(CLASSES.engageLeaveCommand);
			$("#classes-details-form").submit(CLASSES.processDetailsCommand);

			CLASSES.list(); 

			CLASSES.refreshCreation(); 
			$("#classes-details-form").hide();
			$("#classes-edition-form").hide();

			$("#classes-div").show();
		},

		disconnect: function() {

			CLASSES.clean(); 

			$("#classes-creation-form").unbind("submit", CLASSES.create);

			$("#classes-details-submit-start").unbind("click", CLASSES.engageStartCommand);
			$("#classes-details-submit-end").unbind("click", CLASSES.engageEndCommand);
			$("#classes-details-submit-join").unbind("click", CLASSES.engageJoinCommand);
			$("#classes-details-submit-leave").unbind("click", CLASSES.engageLeaveCommand);
			$("#classes-details-form").unbind("submit", CLASSES.processDetailsCommand);
			$("#classes-list a").unbind("click", CLASSES.processHashLink);

			$("#classes-creation-form").hide();
			$("#classes-details-form").hide();
			$("#classes-edition-form").hide();
			
			$("#classes-div").hide();
		},


		refreshCreation: function() {

			var course = COURSES.getSelected(); 
			if (course != null && course.teacher.login == AUTH.getMember()) {
				$("#classes-creation-form").show();
			} else {
				$("#classes-creation-form").hide();
			}
		},


		refreshDetails: function() {

			if (CLASSES.selectedClasse == null) {

				$("#classes-details-id").text('');
				$("#classes-details-course").text('');
				$("#classes-details-subject").text('');
				$("#classes-details-start").text('');
				$("#classes-details-durationHours").text('');
				$("#classes-details-durationMinutes").text('');

			} else {

				$("#classes-details-id").text(CLASSES.selectedClasse.course.id);
				$("#classes-details-course").text(CLASSES.selectedClasse.course.name);
				$("#classes-details-subject").text(CLASSES.selectedClasse.subject);

				$("#classes-details-start").text(CLASSES.selectedClasse.begin);
				if( CLASSES.selectedClasse.end != 0) {
					var duration = new Date(CLASSES.selectedClasse.end.getTime() - CLASSES.selectedClasse.begin.getTime()); 
					$("#classes-details-durationHours").text(duration.getHours() - 1);
					$("#classes-details-durationMinutes").text(duration.getMinutes());
				} else {
					$("#classes-details-durationHours").text("");
					$("#classes-details-durationMinutes").text("");
				}
			}

			// TODO 
			$("#classes-details-submit-start").show();
			$("#classes-details-submit-end").hide();
			$("#classes-details-submit-join").hide();
			$("#classes-details-submit-leave").hide();
		},


		clean: function(e, params) {
			if (e != null) {
				e.preventDefault();
			}

			CLASSES.setSelected(null); 
			$("#classes-details-form").hide();
			$("#classes-edition-form").hide();
			$("#classes-list").empty();

			return false;
		},

		engageStartCommand: function(e, params) {

			CLASSES.startCommandInProgress = true;
		},

		engageEndCommand: function(e, params) {

			CLASSES.endCommandInProgress = true;
		},

		engageJoinCommand: function(e, params) {

			CLASSES.joinCommandInProgress = true;
		},

		engageLeaveCommand: function(e, params) {

			CLASSES.leaveCommandInProgress = true;
		},


		processHashLink: function(e) {
			if (e != null) {
				e.preventDefault();
			}

			GEOCHAT_COMPONENTS.processHashLink(e, this.hash, CLASSES); 
			return false; 
		},


		//SEND functions
		/////////////////////////////////////////////////////////////////////////////////////


		//	app.get('/manage/classes', mod_db_classes.requestList);
		list: function(e, params) {
			if (e != null) {
				e.preventDefault();
			}

			var data = { token: AUTH.session.token };
			$.get("/manage/classes", data , CLASSES.listComplete , "json");

			return false;
		},


		//	app.get('/manage/classes/:id', mod_db_classes.requestGet);
		get: function(e, params) {
			if (e != null) {
				e.preventDefault();
			}

			if (params.id == undefined || params.id == null) {
				alert('The parameter <id> must be specified for get action'); 
			}

			var data = { token: AUTH.session.token };
			$.get("/manage/classes/" + params.id , data, CLASSES.getComplete, "json");

			return false;
		},


		//	app.post('/manage/classes/teacher', mod_db_classes.requestStart);
		create: function(e, params) {
			if (e != null) {
				e.preventDefault();
			}

			var data = { token: AUTH.session.token };
			var course = COURSES.getSelected();
			if (course == null) {
				alert('No course selected for classroom creation'); 
				return; 
			}
			data.course = course.id 
			data.subject = $("#classes-creation-subject").val();

			var beginDate = 0; 
			var endDate = 0; 
			var startMode = $('#classes-creation-form').find('input[name=classes-creation-start-when]:checked').val();
			if ($('#classes-creation-startAt').val() == startMode) {

				beginDate = $("#classes-creation-startDate").datepicker('getDate'); 
				var startHour = $("#classes-creation-startHour").timepicker('getTime');
				beginDate.setHours(startHour.getHours(), startHour.getMinutes()); 

				endDate = new Date(); 
				var duration = $('#classes-creation-duration').timepicker('getTime'); 
				endDate.setTime(beginDate.getTime() + duration.getHours()*3600000 + duration.getMinutes()*60000); 
				
			} else {
				
				beginDate = new Date(); 
				
				endDate = new Date(); 
				endDate.setTime(beginDate.getTime() + 8*3600000); 
			}
			
			data.begin = beginDate; 
			data.end = endDate; 

			$.ajax({
				type: "POST",
				url: "/manage/classes/teacher",
				data: JSON.stringify(data),
				contentType: "application/json; charset=utf-8",
				dataType: "json"
			}).done(CLASSES.createComplete);

			return false;
		},


		processDetailsCommand: function(e, params) {
			if (e != null) {
				e.preventDefault();
			}

			//	app.post('/manage/classes/teacher', mod_db_classes.requestStart);
			if (CLASSES.startCommandInProgress) {

				var data = { token: AUTH.session.token };
				data.course = CLASSES.selectedClasse.course.id; 
				data.subject = CLASSES.selectedClasse.subject;
				data.begin = new Date(); 
				data.end = ''; 

				$.ajax({
					type: "POST",
					url: "/manage/classes/teacher",
					data: JSON.stringify(data),
					contentType: "application/json; charset=utf-8",
					dataType: "json"
				}).done(CLASSES.startComplete);
			}

			//	app.delete('/manage/classes/teacher/:id', mod_db_classes.requestEnd);
			if (CLASSES.endCommandInProgress) {

				$.ajax({
					type: "DELETE",
					url: "/manage/classes/teacher" + $("#courses-details-id").text(),
					data: JSON.stringify({ token: AUTH.session.token }),
					contentType: "application/json; charset=utf-8",
					dataType: "json"
				}).done(CLASSES.endComplete);
			}

			//	app.post('/manage/classes/student/:id', mod_db_classes.requestJoin);
			if (CLASSES.joinCommandInProgress) {

				$.ajax({
					type: "POST",
					url: "/manage/classes/student/" + $("#classes-details-id").text(),
					data: JSON.stringify({ token: AUTH.session.token }),
					contentType: "application/json; charset=utf-8",
					dataType: "json"
				}).done(CLASSES.joinComplete);
			}

			//	app.delete('/manage/classes/student/:id', mod_db_classes.requestLeave);
			if (CLASSES.leaveCommandInProgress) {

				$.ajax({
					type: "DELETE",
					url: "/manage/classes/student/" + $("#courses-details-id").text(),
					data: JSON.stringify({ token: AUTH.session.token }),
					contentType: "application/json; charset=utf-8",
					dataType: "json"
				}).done(CLASSES.leaveComplete);
			}

			CLASSES.startCommandInProgress = false;
			CLASSES.endCommandInProgress = false;
			CLASSES.joinCommandInProgress = false;
			CLASSES.leaveCommandInProgress = false;

			return false;
		},


		//RECEIVE functions
		/////////////////////////////////////////////////////////////////////////////////////


		listComplete: function(info) {

			var list = $("<ul></ul>");

			var course = COURSES.getSelected(); 
			$(info.result).each(function(index, classe) {
				if (course == null || classe.course == course.id) {

					var item = $("<li><a></a></li>");
					// app.get('/manage/classes/:id', mod_db_classes.requestStart);
					$("a", item).attr("id", classe.id).attr("href", "#get?id=" + classe.id).click(CLASSES.processHashLink).text(classe.subject);
					list.append(item);
				}
			});

			$("#classes-list").empty().append(list);
		},


		getComplete: function(info) {

			if (info.success) {

				var classeInfo = info.result; 
				var beginTime = new Date(info.result.begin); 
				classeInfo.begin = beginTime; 
				var endTime = new Date(info.result.end);
				classeInfo.end = endTime; 
				
				CLASSES.setSelected(info.result); 

			} else {
				CLASSES.clean(); 
				alert(info.message); 
			}
		},


		createComplete: function(info) {

			if (info.success) {

				alert("Class #" + info.result.id + " : \"" + info.result.subject + "\" has been created"); 

				var classeInfo = info.result; 
				var beginTime = new Date(info.result.begin); 
				classeInfo.begin = beginTime; 
				var endTime = new Date(info.result.end);
				classeInfo.end = endTime; 
				
				CLASSES.list(); 
				CLASSES.setSelected(classeInfo); 

				var currentTime = new Date();
				if (beginTime.getTime() <= currentTime.getTime() && currentTime.getTime() <= endTime.getTime()) {
					CLASSES.engageStartCommand = true; 
					CLASSES.processDetailsCommand(); 
				}

			} else {
				alert(info.message); 
			}
		},


		startComplete: function(info) {

			if (info.success) {
				
				alert("Class #" + info.result.id + " : \"" + info.result.subject + "\" has started"); 
				
				var classeInfo = info.result; 
				var beginTime = new Date(info.result.begin); 
				classeInfo.begin = beginTime; 
				var endTime = new Date(info.result.end);
				classeInfo.end = endTime; 
				
				CLASSES.list(); 
				CLASSES.setSelected(classeInfo); 
				
			} else {
				alert(info.message); 
			}
		},


		endComplete: function(info) {

			if (info.success) {
				
				alert("Class #" + info.result.id + " : \"" + info.result.subject + "\" has ended");
				
				var classeInfo = info.result; 
				var beginTime = new Date(info.result.begin); 
				classeInfo.begin = beginTime; 
				var endTime = new Date(info.result.end);
				classeInfo.end = endTime; 
				
				CLASSES.list(); 
				CLASSES.setSelected(classeInfo); 
				
			} else {
				alert(info.message); 
			}
		},


		joinComplete: function(info) {

			if (info.success) {
				alert("You have joined class #" + info.result.id + " : \"" + info.result.subject + "\""); 
			} else {
				alert(info.message); 
			}
		},


		leaveComplete: function(info) {

			if (info.success) {
				alert("You have left class #" + info.result.id + " : \"" + info.result.subject + "\""); 
			} else {
				alert(info.message); 
			}
		}

};