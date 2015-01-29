window.AUTH = {


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


		loginAccepted: function(info) {

			$.getScript("js/main.js").done(function() {

				AUTH.session.token = info.token;
				localStorage.token = info.token; 
				AUTH.session.user = info.user.login; 
				localStorage.user = info.user.login; 

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


		loginRefused: function() {
			
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


		login: function(info) {
			if (info.token != '' && info.error == '') {
				AUTH.loginAccepted(info);
			} else {
				AUTH.loginRefused();
			}
			AUTH.autoAuthenticationInProgress = false;
		},


		logout: function(info) {

			AUTH.session = {}; 
			delete localStorage.token; 
			delete localStorage.user; 

			$("#loginHeader").show();
			$("#logoutHeader").hide();
			$("#logMessage").hide(); 
			
			COURSES.disconnect(); 	
		}
};


$(document).ready(function() {
	window.AUTH.initialize();
});

