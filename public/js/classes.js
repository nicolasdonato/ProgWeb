window.CLASSES = {


		startCommandInProgress: false, 
		endCommandInProgress: false, 
		joinCommandInProgress: false, 
		leaveCommandInProgress: false, 


		selectedClasse : null, 
		
		
		//Module management
		/////////////////////////////////////////////////////////////////////////////////////


		initialize : function(){
			//
			// On ne peut pas écrire ou coller dans ces boutons
			//
			$("#classes-creation-start, #classes-creation-duration").keypress(function(e){ e.preventDefault(); return false;});
			$("#classes-creation-start, #classes-creation-duration").bind('paste', function(e){ e.preventDefault(); return false;});
			//
			// voir http://jqueryui.com/datepicker/#date-range
			//
			$("#classes-creation-start").datepicker({
				format : 'dd/mm/yyyy'
			});
			$('#classes-creation-duration').timepicker({ 
				timeFormat: 'g:ia',
				//showDuration: true,
				//useSelect: true ,
				scrollDefault: 'now' });
			
			/*
			 * 
            var day1 = $("#classes-creation-start").datepicker('getDate').getDate();                 
            var month1 = $("#classes-creation-start").datepicker('getDate').getMonth() + 1;             
            var year1 = $("#classes-creation-start").datepicker('getDate').getFullYear();
            var date = new Date(year1, month1 ,day1);
            
            var dateFin = $('#classes-creation-duration').timepicker('getTime', date);
			 * */
			//
			//voir options : https://jonthornton.github.io/jquery-timepicker/
			//
//			
//			$('#classes-creation-duration').timeppasteicker('setTime', new Date());
//			$('#classes-creation-duration').timepicker({
//			    'minTime': '2:00pm',
//			    'maxTime': '11:30pm',
//			    'showDuration': true
//			});
			$("#classes-creation-form input[name=classes-creation-start-when]").click(function(e){
				//
				//activer / desactiver la saisie de la date en fonction du radio sélectionné
				//
				switch($(e.target).val()){
				case "NOW":
					
					$("#classes-creation-start").val("");
					$("#classes-creation-duration").val("");
					
					$("#classes-creation-start").attr('disabled','disabled');
					$("#classes-creation-duration").attr('disabled','disabled');
					break;
				case "DELAY":
					
					$("#classes-creation-start").removeAttr('disabled');
					$("#classes-creation-duration").removeAttr('disabled');
					
					//$("#classes-creation-start").show();
					//$("#classes-creation-duration").show();
					break;
					
				}
			});

			//
			// au chargement c'est l'option démarrage immédiat qui est sélectionnée
			//
			$("#classes-creation-startNow").click();
		},
		
		
		getSelected: function() {
			return CLASSES.selectedClasse; 
		}, 

		
		setSelected: function(classe) {
			$("#classes-list a").removeClass("selected-classe");
			if( classe != null){
				$("#classes-list a[id="+ classe.id +"]").addClass("selected-classe");
				$("#classes-details-form").show();
			}
			else{
				$("#classes-details-form").hide();
			}
			CLASSES.selectedClasse = classe; 
			
			CLASSES.refreshDetails(); 
			
		}, 

		
		// Appelée à chaque AUTH.loginAccepted()
		connect: function() {
			$("#classes-details-form input[type=submit]").hide();

			$("#classes-details-submit-start").click(CLASSES.engageStartCommand);
			$("#classes-details-submit-end").click(CLASSES.engageEndCommand);
			$("#classes-details-submit-join").click(CLASSES.engageJoinCommand);
			$("#classes-details-submit-leave").click(CLASSES.engageLeaveCommand);
			$("#classes-details-form").submit(CLASSES.processDetailsCommand);

			//Tous les liens du container sont liés à l'action processHashLink
			$("#classes-list a").click(CLASSES.processHashLink);

			CLASSES.list(); 
			
			CLASSES.refreshCreation(); 
			
			$("#classes-details-form").hide();
			$("#classes-edition-form").hide();

			$("#classes-div").show();
		},
		
		
		disconnect: function() {
			// TODO 
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
			$("#classes-details-id").text(CLASSES.selectedClasse.course.id);
			$("#classes-details-course").text(CLASSES.selectedClasse.course.name);
			$("#classes-details-subject").text(CLASSES.selectedClasse.subject);
			$("#classes-details-start").text(CLASSES.selectedClasse.begin);
			if( CLASSES.selectedClasse.end != 0)
				$("#classes-details-duration").text(CLASSES.selectedClasse.end - CLASSES.selectedClasse.begin);
			else 
				$("#classes-details-duration").text("");
			
			$("#classes-details-submit-start").show();
//			$("#classes-details-submit-end").click(CLASSES.engageEndCommand);
//			$("#classes-details-submit-join").click(CLASSES.engageJoinCommand);
//			$("#classes-details-submit-leave").click(CLASSES.engageLeaveCommand);
			
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


		//	app.get('/manage/courses/:id', mod_db_courses.getRequest);
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


		processDetailsCommand: function(e, params) {
			if (e != null) {
				e.preventDefault();
			}

			if(CLASSES.startCommandInProgress){

				var data = { token: AUTH.session.token };
				data.course = $("#classes-creation-course").val();
				data.subject = $("#classes-creation-subject").val();

				var startDate; 
				var duration = 12 * 3600; 
				if ($("#classes-creation-startAt").selected()) {
					startDate = $("#classes-creation-start").val();
					duration = $("#classes-creation-duration").val();
				}
				var endDate = startDate + duration; 
				data.start = startDate; 
				data.end = endDate; 

				$.ajax({
					type: "POST",
					url: "/manage/classes/teacher",
					data: JSON.stringify(data),
					contentType: "application/json; charset=utf-8",
					dataType: "json"
				}).done(CLASSES.startComplete);
			}

			if (CLASSES.endCommandInProgress) {

				$.ajax({
					type: "DELETE",
					url: "/manage/classes/teacher" + $("#courses-details-id").text(),
					data: JSON.stringify({ token: AUTH.session.token }),
					contentType: "application/json; charset=utf-8",
					dataType: "json"
				}).done(CLASSES.endComplete);
			}

			if (CLASSES.joinCommandInProgress) {

				$.ajax({
					type: "POST",
					url: "/manage/classes/student/" + $("#classes-details-id").text(),
					data: JSON.stringify({ token: AUTH.session.token }),
					contentType: "application/json; charset=utf-8",
					dataType: "json"
				}).done(CLASSES.joinComplete);
			}

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
					$("a", item).
						attr("id", classe.id).
						attr("href", "#get?id=" + classe.id).
						click(CLASSES.processHashLink).
						text(classe.subject);
					list.append(item);
				}
			});

			$("#classes-list").empty().append(list);
		},


		getComplete: function(info) {

			if (info.success) {
				
				CLASSES.setSelected(info.result); 

			} else {
				CLASSES.clean(); 
				alert(info.message); 
			}
		},


		startComplete: function(info) {

			if (info.success) {
				alert("Class #" + info.result.id + " : \"" + info.result.subject + "\" has started"); 
			} else {
				alert(info.message); 
			}
		},


		endComplete: function(info) {

			if (info.success) {
				alert("Class #" + info.result.id + " : \"" + info.result.subject + "\" has ended");
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
		},


};
