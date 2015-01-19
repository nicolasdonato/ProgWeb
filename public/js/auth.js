
var token = ''; 


var auth = io.connect("/session/login");

//auth.emit('listUsers');

var on_connectionApproved = function (data) {
	var userName = $("#login").val();
	$("#userName").val(userName);
	$("#token").val(data.token);
	
	$("#loginInProgress").hide();
	$("#connectionData").text("Hello "+userName+", your connection token is : "+ data.token);
	
	// Asynchronously Load the map API 
	/*var script = document.createElement('script');
	script.src = "js/main.js";
	document.head.appendChild(script);*/
	
	$.getScript("js/main.js")
	.done(function() {

		$("#connectionData").show();
		$("#container").show();
	})
	.fail(function() {

});
};

var on_connectionRefused = function () {
	$("#loginInProgress").hide();
	$("#connectionData").text('LOGIN FAILED');
	$("#connectionData").show();
	$("#loginForm").show();
};

var on_connectionResult = function(data){
	if(data.authenticated){
		on_connectionApproved(data);
	}
	else {
		on_connectionRefused();
	}
};

auth.on("userList", function (list) {
	
	for (var index in list) {
		var line = $("#users").text() + "\n" + list[index].name + " " + list[index].password; 
		$("#users").text(line);
	}
});


auth.on('log', function (array) {
  console.log.apply(console, array);
});


auth.on('connectionApproved', on_connectionApproved);

auth.on('connectionRefused', on_connectionRefused);


function getMember() {
	return jQuery("#userName").val();
}

var authBySocket = false;
var authByAjax = true;

var serverUrl = "session/login"
	
function authenticate() {
	
	$("#loginForm").hide();
	$("#loginForm").hide();
	$("#loginInProgress").show();

	var data = { login: $("#login").val(), password: $("#pwd").val() };
	
	if(authBySocket){
		auth.emit("authentification", data);
	}
	if(authByAjax){
		$.post(serverUrl, data , on_connectionResult, "json");
	}
	
	return false;
}
