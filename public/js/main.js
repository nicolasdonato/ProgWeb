'use strict';

/////////////////////////////////////////
// Objects initialization
//

//
// Map initialization : renamed window.GEOCHAT_MAP.map
//		--> moved to maps.js inside window.GEOCHAT_MAP object, initialized via google callback after script loading 
//		-->	look at the url used in auth.js - loginAccepted()
//



/////////////////////////////////////////
// Visual interactions & DOM events
//

//add member name to the local video
$('#localMember').text(AUTH.getMember());


/////////////////////////////////////////
// Start the chat room and the other components
//

// Can fill a room in the URL Path
var room = location.pathname.substring(1);
if (room === '') {
//  room = prompt('Enter room name:');
  room = 'foo';
} else {
  //
}

//
// ce composant est initialisé une fois pour toutes lors du premier login valide
// il appelle dans la foulée la méthode initialize() sur tous les composants MAP, RTC, COURS
//
window.GEOCHAT_COMPONENTS = {
		
		initialized	: false,
		
		initialize 	: function(){
			
			if( GEOCHAT_COMPONENTS.initialized ){
				console.log("Initialization has already been performed, you shouldn't see this message...");
				return;
			}
			
			WEB_RTC_NODE.initialize();

			CHAT.initialize();

			COURSES.initialize();
			
			CLASSES.initialize();
			
			FILE_TRANSFER.initialize();
			
			REPOSITORY.initialize();
			 
			//
			// NE SURTOUT PAS initialiser GEOCHAT_MAP ici !!! ce doit être fait automatiquement par le callback du script google maps, voir AUTH.googleMapsApiLoaded dans AUTH.loginAccepted
			//GEOCHAT_MAP.initialize();
			
			GEOCHAT_COMPONENTS.initializeEvents();

			// initialization of the room or join the room
			if (room !== '') {
			  console.log('Create or join room', room);
			  CHAT.sendMessage('create or join', room);
			}
			
			GEOCHAT_COMPONENTS.initialized = true;
		},


		/////////////////////////////////////////
		//Window events
		//
		initializeEvents : function(){
			/*
			* Used when the user close the chat window
			*/
			window.onbeforeunload = function(e){
				//sendMessage('bye');
				//
				// ça irait bien dans le disconnect de WEB_RTC_NODE,  non ?
				//
				WEB_RTC_NODE.component.webrtc.hangup();
				//map.closeLocation();
				//GEOCHAT_MAP.map.closeLocation();
			}
		},


		////////////////////////////////////////////////
		//these 2 functions are called resp. after successfull login and logout
		//
		connect 	: function(){
			COURSES.connect();
			GEOCHAT_MAP.connect();
			CLASSES.connect();
			REPOSITORY.connect();
			// TO IMPLEMENT : connect  for 
			//		- WEB_RTC_NODE
			//		- CHAT
			//		- FILE_TRANSFER
		},
		
		
		disconnect 	: function(){
			COURSES.disconnect(); 	
			GEOCHAT_MAP.disconnect();
			CLASSES.disconnect();
			REPOSITORY.disconnect();
			// TO IMPLEMENT : disconnect for 
			//		- WEB_RTC_NODE
			//		- CHAT
			//		- FILE_TRANSFER
		},
		
		
		processHashLink: function(e, hash, module) {
			try {

				var questionIndex = hash.indexOf('?'); 

				var action = '';
				var params = {};
				if (questionIndex > -1) {

					action = hash.substr(1, questionIndex - 1);
					if (action == '') {
						throw new Error('Bad format #0 of hash link <' + hash + '>');
					}

					var parameters = hash.substr(questionIndex + 1);
					if (parameters == '') {
						throw new Error('Bad format #1 of hash link <' + hash + '>');
					}

					var ampersand = -1; 
					do {

						ampersand = parameters.indexOf('&'); 
						if (ampersand > -1) {

							var parameter = parameters.substr(0, ampersand); 
							var equalIndex = parameter.indexOf('=');
							if (equalIndex < 0) {
								throw new Error('Bad format #2 of hash link <' + hash + '>'); 
							}
							var param = parameter.substr(0, equalIndex); 
							var value = parameter.substr(equalIndex + 1); 
							if (param == '' || value == '') {
								throw new Error('Bad format #3 of hash link <' + hash + '>'); 
							}
							params[param] = value; 

							parameters = parameters.substr(ampersand + 1); 

						} else {

							var parameter = parameters; 
							var equalIndex = parameter.indexOf('=');
							if (equalIndex < 0) {
								throw new Error('Bad format #4 of hash link <' + hash + '>'); 
							}
							var param = parameter.substr(0, equalIndex); 
							var value = parameter.substr(equalIndex + 1); 
							if (param == '' || value == '') {
								throw new Error('Bad format #5 of hash link <' + hash + '>'); 
							}
							params[param] = value; 
						}

					} while(ampersand > -1); 

				} else {
					action = hash.substr(1); 
				}

				if (module[action] == undefined || module[action] == null) {
					alert('The action <' + action + '> is unknown for this module'); 
					return; 
				}

				module[action](e, params); 

			} catch (err) {

				alert('Failed to parse hash link <' + hash + '> : ' + err.message); 
			}
		}

};
