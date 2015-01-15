
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
	token = data; 
	$("#loginInProgress").hide();
	$("#connectionData").text(token);
	$("#connectionData").show();
});


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
