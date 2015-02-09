window.AUTH = {
		
		//Module management
		/////////////////////////////////////////////////////////////////////////////////////

		session: {},
		
		googleMapsApiLoaded 			: false, //google maps api should only be loaded once

		autoAuthenticationInProgress 	: false,

		getMember: function() {
			if(AUTH.session.length == 0){
				throw new Error('You\'re disconnected : please authentify');
			}
			return AUTH.session.user;
		},

		getRole: function() {
			return AUTH.session.role;
		},

		initialize: function() {
		    $('#loginForm').on('keyup', GEOCHAT_VIEW.login);
		    $('#logout').click(GEOCHAT_VIEW.logout);
		},
		
		
		load : function() {
		    
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

			var mainScriptLoader = function() {
				
				$.getScript('js/main.js').done(function() {
					
					AUTH.session.token = info.result.token;
					localStorage.token = info.result.token; 
					AUTH.session.user = info.result.user.login; 
					localStorage.user = info.result.user.login; 
					AUTH.session.role = info.result.user.role; 
					localStorage.role = info.result.user.role; 

					if(! GEOCHAT_COMPONENTS.initialized){
						GEOCHAT_COMPONENTS.initialize();
					}
					
					GEOCHAT_VIEW.loginSuccess();
					GEOCHAT_COMPONENTS.connect()


				}).fail(function() {
					console.error('Failed to find <'+ script +'>'); 
				});
				
			};
			
			var localSocket = true;
			//
			// Les scripts sont chargés dans cet ordre
			//
		    var scripts = [];
		    
		    scripts.push((localSocket ? "" : "..") + "/socket.io/socket.io.js");
		    scripts.push("js/chat.js");
		    //
		    //Charger maps avant google maps pour permettre l'initialisation via le callback
		    // à la limite 2 autres fonctions show/hide auraient leur place dans les fonction d'init de main.js dans l'idée du connect/disconnect
		    //
		    scripts.push("js/maps.js");
		    if( ! AUTH.googleMapsApiLoaded){
		    	//
		    	// en cas de déco/reco il ne faut pas que ce script soit chargé une deuxième fois... d'ailleurs peut-etre que les autres non plus
		    	// il faudrait une distinction claire entre composant / initialisation / activation / désactivation
			    scripts.push("http://maps.google.com/maps/api/js?sensor=false&callback=window.GEOCHAT_MAP.initialize");
		    	AUTH.googleMapsApiLoaded = true;
		    }
		    scripts.push("js/webrtc.js");
		    scripts.push("js/lib/File.js");
		    scripts.push("js/fileSharing.js");
		    scripts.push("js/courses.js");
		    
		    //
		    //Chargé depuis index.html visiblement...
		    //scripts.push("js/test.js");
			var scriptLoader = function(script, callback){
				$.getScript(script).done(function(){
					if(callback != null) {
						callback();
					}
				}).fail(function() {
					console.error('Failed to find <'+ script +'>'); 
				});
		    };

		    var loaders = [];
		    var currentLoader = null;
		    
		    scripts.reverse().forEach(function(script) {

		    	if (loaders.length == 0) {
			    	loaders.push(function() {
			    		mainScriptLoader();
			    	});
		    	}

	    		var lastLoader = loaders[ loaders.length - 1 ];
		    	loaders.push(function() {
		    		scriptLoader(script, lastLoader);
		    	});

		    });

	    	if(loaders.length == 0){
		    	throw new Error('Connection malfunction, please reconnect');
	    	}
	    	
	    	loaders[loaders.length - 1]();
	    	
		},


		loginRefused: function(info) {

			if(! AUTH.autoAuthenticationInProgress)
			{
				GEOCHAT_VIEW.loginFail();
			}

			AUTH.session = {}; 
			delete localStorage.token; 
			delete localStorage.user; 	
			delete localStorage.role; 	
		},


		//SEND functions
		/////////////////////////////////////////////////////////////////////////////////////


		requestLogin: function(login, pass) {
			var data = { login: login, password: pass };
			$.post("/session/login", data, AUTH.login, "json");
			AUTH.session.user = data.login; 
			localStorage.user = data.login; 
		},


		requestLogout: function() {
			var data = { token: AUTH.session.token }; 
			$.post("/session/logout", data, AUTH.logout, "json");
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
				delete localStorage.role; 
				//
				//Devrait être appelée depuis la vue, à bon entendeur...
				//
		  		GEOCHAT_COMPONENTS.disconnect();

			} else {
				alert('Logout failed: ' + info.message); 
			}
		}

};


$(document).ready(function() {
	window.AUTH.load();
});

