window.AUTH = {
	//token: '',
	auth: io.connect("/session/login"),
	users: {},
	enableSocketAuth : false,
	enablePostAuth : true,
	connectionData : {},
	getMember: function() {
		return AUTH.connectionData.userName;
	},
	log : function (array) {
		console.log.apply(console, array);
	},
	initialize : function(){
		$("#loginForm").submit( AUTH.authenticate );
		
		AUTH.auth.on("userList", AUTH.listUsers);
		AUTH.auth.on('log', AUTH.log);

		AUTH.auth.on('connectionApproved', AUTH.connectionApproved);
		AUTH.auth.on('connectionRefused', AUTH.connectionRefused);
		
		AUTH.auth.emit('listUsers');
	},
	listUsers : function (list) {
		AUTH.users = list;
		console.log('--- userList ---');
		console.log(AUTH.users);
	},
	authenticate: function(login, pass) {
		var data = { login: login, password: pass };
		AUTH.connectionData.userName = login;

		if(AUTH.enableSocketAuth) // Still usefull ?
		{
			AUTH.auth.emit("authentification", data);
		}
		if(AUTH.enablePostAuth)
		{
			$.post("/session/login", data , AUTH.authenticationResult, "json");
		}

		return false;
	},
	connectionApproved : function(data){
		if(!data.authenticated){
			AUTH.connectionRefused();
			return;
		}
		
		var userName 	= AUTH.connectionData.userName;
		var token 		= data.token;
		
		// "Refresh" view
		view.loginSuccess();
		
		// Asynchronously Load the map API 
		$.getScript("js/main.js")
		.done(function() {
			AUTH.connectionData.token 		= token;
		})
		.fail(function() {
		});
	},
	connectionRefused : function(data){
		// "Refresh" view
		view.loginFail();
	},
	authenticationResult : function(data){
		if(data.authenticated){
			AUTH.connectionApproved(data);
		}
		else {
			AUTH.connectionRefused();
		}
	}
};

$(document).ready(function(){
	window.AUTH.initialize();
});
