window.AUTH = {


		session: {},


		getMember: function() {
			return AUTH.session.user;
		},


		initialize: function() {
			$("#loginForm").submit(AUTH.requestLogin);
			$("#logoutForm").submit(AUTH.requestLogout);
		},


		requestLogin: function(e) {

			var data = { login: $("#login").val(), password: $("#pwd").val() };
			$.post("/session/login", data, AUTH.login, "json");
			AUTH.session.user = data.login; 

			e.preventDefault();
		},


		requestLogout: function(e) {
			
			var data = { token: AUTH.session.token }; 
			$.post("/session/logout", data, AUTH.logout, "json");
			
			e.preventDefault();
		},


		loginAccepted: function(data) {

			// TODO : load project in #main

			// Asynchronously Load the map API 
			$.getScript("js/main.js").done(function() {

				AUTH.session.token = data.token;

				$("#user").text(AUTH.session.user);
				$("#loginHeader").hide();
				$("#login").val('');
				$("#pwd").val('');
				$("#logoutHeader").show();
				$("#logMessage").hide(); 

			}).fail(function() {
				console.error('Failed to find <js/main.js>'); 
			});
		},


		loginRefused: function() {
			$("#loginHeader").show();
			$("#login").val('');
			$("#pwd").val('');
			$("#logoutHeader").hide();
			$("#logMessage").text('Wrong login/password !');
			$("#logMessage").show(); 
		},


		login: function(data) {
			if (data.authenticated) {
				AUTH.loginAccepted(data);
			} else {
				AUTH.loginRefused();
			}
		},


		logout: function(data) {

			this.session = {}; 

			$("#loginHeader").show();
			$("#logoutHeader").hide();
			$("#logMessage").hide(); 
		}
};


$(document).ready(function() {
	window.AUTH.initialize();
});

