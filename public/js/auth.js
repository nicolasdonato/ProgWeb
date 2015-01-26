window.AUTH = {
		//token: '',
		auth: io.connect("/session/login"),
		users: {},
		enableSocketAuth : true,
		enablePostAuth : false,
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
		authenticate: function(e) {
			if (e.keyCode === 13) {
				
				$("#loginForm").css('display', 'none');
				$("#rooms").css('display', 'inline');
				$("#deco").css('display', 'inline');

				var data = { login: $("#login").val(), password: $("#pwd").val() };

				AUTH.connectionData.userName = data.login;
				if(AUTH.enableSocketAuth)
				{
					AUTH.auth.emit("authentication", data);
				}
				if(AUTH.enablePostAuth)
				{
					$.post("/session/login", data , AUTH.authenticationResult, "json");
				}
				e.preventDefault();
			}

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
