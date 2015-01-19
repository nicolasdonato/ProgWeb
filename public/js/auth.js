
var token = ''; 


var auth = io.connect("/auth");

auth.emit('listUsers');


auth.on("userList", function (list) {
	
	for (var index in list) {
		var line = $("#users").text() + "\n" + list[index].name + " " + list[index].password; 
		$("#users").text(line);
	}
});


auth.on('log', function (array) {
  console.log.apply(console, array);
});


auth.on('connectionApproved', function (data) {
	user = data.userName;
	token = data.token; 
	$("#loginInProgress").hide();
	$("#connectionData").text(token);
	jQuery("#userName").val(user);
	jQuery("#token").val(token);
	$("#connectionData").show();
	
	jQuery("#container").show();
	// Asynchronously Load the map API 
	var script = document.createElement('script');
	script.src = "js/main.js";
	document.head.appendChild(script);
});

function getMember() {
	return jQuery("#userName").val();
}

auth.on('connectionRefused', function () {
	$("#loginInProgress").hide();
	$("#connectionData").text('LOGIN FAILED');
	$("#loginForm").show();
});


function authenticate() {
	
	$("#loginForm").hide();
	$("#loginInProgress").show();
	
	auth.emit("authentification", { login: $("#login").val(), password: $("#pwd").val() });
	
	return false;
}
