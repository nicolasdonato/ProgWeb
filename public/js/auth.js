window.AUTH = {


		//Module management
		/////////////////////////////////////////////////////////////////////////////////////


		session: {},

		autoAuthenticationInProgress : false,

		getMember: function() {
			return AUTH.session.user;
		},


		initialize: function() {

			$("#loginForm").submit(AUTH.requestLogin);
			$("#logoutForm").submit(AUTH.requestLogout);

			if (AUTH.session.token == undefined) {
				if (localStorage.token != undefined) {
					AUTH.autoAuthenticationInProgress = true;
					AUTH.session.user = localStorage.user;
					$.post("/session/login", { token: localStorage.token }, AUTH.login, "json");
				}
			}
		},


		loginAccepted: function(info) {

			$.getScript("js/main.js").done(function() {

				AUTH.session.token = info.result.token;
				localStorage.token = info.result.token; 
				AUTH.session.user = info.result.user.login; 
				localStorage.user = info.result.user.login; 

				$("#user").text(AUTH.session.user);
				$("#loginHeader").hide();
				$("#login").val('');
				$("#pwd").val('');
				$("#logoutHeader").show();
				$("#logMessage").hide(); 

				COURSES.initialize(); 

			}).fail(function() {
				console.error('Failed to find <js/main.js>'); 
			});
		},


		loginRefused: function(info) {

			$("#loginHeader").show();
			$("#login").val('');
			$("#pwd").val('');
			$("#logoutHeader").hide();
			if(! AUTH.autoAuthenticationInProgress){
				$("#logMessage").text('Wrong login/password !');
				$("#logMessage").show(); 
			}

			AUTH.session = {}; 
			delete localStorage.token; 
			delete localStorage.user; 	
		},


		//SEND functions
		/////////////////////////////////////////////////////////////////////////////////////


		requestLogin: function(e) {

			var data = { login: $("#login").val(), password: $("#pwd").val() };
			$.post("/session/login", data, AUTH.login, "json");
			AUTH.session.user = data.login; 
			localStorage.user = data.login; 

			e.preventDefault();
		},


		requestLogout: function(e) {

			var data = { token: AUTH.session.token }; 
			$.post("/session/logout", data, AUTH.logout, "json");

			e.preventDefault();
		},


		//RECEIVE functions
		/////////////////////////////////////////////////////////////////////////////////////


		login: function(info) {
			if (info.success) {
				AUTH.loginAccepted(info);
			} else {
				AUTH.loginRefused(info);
			}
			AUTH.autoAuthenticationInProgress = false;
		},


		logout: function(info) {

			if (info.success) {

				AUTH.session = {}; 
				delete localStorage.token; 
				delete localStorage.user; 

				$("#loginHeader").show();
				$("#logoutHeader").hide();
				$("#logMessage").hide(); 

				COURSES.disconnect(); 	

			} else {
				alert('Logout failed: ' + info.message); 
			}
		}

};


$(document).ready(function() {
	window.AUTH.initialize();
});

