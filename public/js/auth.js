window.AUTH = {
<<<<<<< HEAD
	//token: '',
	auth: io.connect("/session/login"),
	users: {},
	enableSocketAuth : true,
	enablePostAuth : false,
=======
	token: '',
	auth: io.connect("/auth"),
	users: {},
>>>>>>> 628b25ae75902bc3f5a94d16322cf838d2b23cac
	connectionData : {},
	getMember: function() {
		return AUTH.connectionData.userName;
	},
<<<<<<< HEAD
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
	authenticate: function(e) {
		$("#loginForm").hide();
		$("#loginInProgress").show();

		var data = { login: $("#login").val(), password: $("#pwd").val() };

		AUTH.connectionData.userName = data.login;
		if(AUTH.enableSocketAuth)
		{
			AUTH.auth.emit("authentification", data);
		}
		if(AUTH.enablePostAuth)
		{
			$.post("/session/login", data , AUTH.authentificationResult, "json");
		}
		e.preventDefault();
		return false;
	},
	connectionApproved : function(data){
		
		if(!data.authenticated){
			AUTH.connectionRefused();
			return;
		}
		
		var userName 	= AUTH.getMember();
		var token 		= data.token;
		
		// TODO : load project in #main
		
		// Asynchronously Load the map API 
		$.getScript("js/main.js")
		.done(function() {
			AUTH.connectionData.userName 	= userName;
			AUTH.connectionData.token 		= token;
			$("#userName").val(userName);
			$("#token").val(token);
			
			$("#loginInProgress").hide();
			$("#connectionData").text("Hello "+userName+", your connection token is : "+ token);
			$("#connectionData").show();
		})
		.fail(function() {
		});
	},
	connectionRefused : function(data){
		$("#loginInProgress").hide();
		$("#connectionData").text('LOGIN FAILED');
		$("#connectionData").show();
		$("#loginForm").show();
	},
	authentificationResult : function(data){
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


=======
	authenticate: function(e) {
		if(e.keyCode === 13){
			$("#loginForm").hide();

			AUTH.auth.emit("authentification", { login: $("#login").val(), password: $("#pwd").val() });
		}
		return false;
	}
};

AUTH.auth.emit('listUsers');

AUTH.auth.on("userList", function (list) {
	AUTH.users = list;
	console.log('--- userList ---');
	console.log(AUTH.users);
});

AUTH.auth.on('log', function (array) {
  console.log.apply(console, array);
});

AUTH.auth.on('connectionApproved', function (data) {
	AUTH.connectionData.userName 	= data.userName;
	AUTH.connectionData.token 		= data.token;
	
	// TODO : load project in #main

	// Asynchronously Load the map API 
	var script = document.createElement('script');
	script.src = "js/main.js";
	document.head.appendChild(script);
});

AUTH.auth.on('connectionRefused', function () {
	// TODO handle login error
});
>>>>>>> 628b25ae75902bc3f5a94d16322cf838d2b23cac
