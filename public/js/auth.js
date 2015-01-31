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
			
			//
			// Chargement des scripts en callback recursifs jusqu'au main.js en dernier, voir ci-dessous
			//

			var mainScriptLoader = function(){
				
				$.getScript('js/main.js').done(function(){
					
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

					//
					// globalInitialization est définie dans main.js et contient l'init des composants 
					//
					if(typeof globalInitialization != "function"){
						throw new Error("Function globalInitialization must be defined in main.js");
					}
					
					globalInitialization();
				}).fail(function() {
					console.error('Failed to find <'+ script +'>'); 
				});
				
			};
			
			var localSocket = true;
			//
			// Les scripts sont chargés dans cet ordre
			//
		    var scripts = [];
		    scripts.push("http://maps.google.com/maps/api/js?sensor=false");
		    
		    scripts.push((localSocket ? "" : "..") + "/socket.io/socket.io.js");
		    scripts.push("js/chat.js");
		    scripts.push("js/maps.js");
		    scripts.push("js/webrtc.js");
		    scripts.push("js/File.js");
		    scripts.push("js/courses.js");
		    scripts.push("js/test.js");

			var scriptLoader = function(script, callback){
				$.getScript(script).done(function(){
					if(callback != null)
						callback();
				}).fail(function() {
					console.error('Failed to find <'+ script +'>'); 
				});
		    };

		    var loaders = [];
		    var currentLoader = null;
		    
		    scripts.reverse().forEach(function(script){

		    	if(loaders.length == 0){
			    	loaders.push(function(){
			    		scriptLoader(script, mainScriptLoader);
			    	});
		    	}

	    		var lastLoader = loaders[ loaders.length - 1 ];
		    	loaders.push(function(){
		    		scriptLoader(script, lastLoader);
		    	});

		    });

	    	if(loaders.length == 0){
		    	throw new Error('Connection malfunction, please reconnect');
	    	}
	    	
	    	loaders[ loaders.length - 1 ]();
	    	
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
				
				if(typeof globalDisconnect != "function"){
					throw new Error("Function globalDisconnect must be defined in main.js");
				}
				
				globalDisconnect();

			} else {
				alert('Logout failed: ' + info.message); 
			}
		}

};


$(document).ready(function() {
	window.AUTH.initialize();
});

