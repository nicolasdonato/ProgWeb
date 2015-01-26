window.AUTH = {
	token: '',
	auth: io.connect("/auth"),
	users: {},
	connectionData : {},
	getMember: function() {
		return AUTH.connectionData.userName;
	},
	authenticate: function(e) {
		if(e.keyCode === 13){
			$("#loginForm").css('display', 'none');
			$("#rooms").css('display', 'inline');
			$("#deco").css('display', 'inline');

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
