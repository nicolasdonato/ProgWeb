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
			
			FILE_TRANSFER.initialize();
			
			GEOCHAT_MAP.initialize();
			
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
			// TO IMPLEMENT : connect  for 
			//		- WEB_RTC_NODE
			//		- CHAT
			//		- FILE_TRANSFER
		},
		
		
		disconnect 	: function(){
			COURSES.disconnect(); 	
			GEOCHAT_MAP.disconnect();
			// TO IMPLEMENT : disconnect for 
			//		- WEB_RTC_NODE
			//		- CHAT
			//		- FILE_TRANSFER
		}
		
		
};
