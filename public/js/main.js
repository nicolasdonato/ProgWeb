'use strict';

// initialisation des objets
var webrtc = new WebRTC({
	localVideo: document.querySelector('#localVideo'),
	remoteVideo: document.querySelector('#remoteVideo'),
	localMember: function() {
		return getMember();
	},
	// definition des contraintes
	constraints: {video: true},
	// Configuration des serveurs stun...
	pc_config: webrtcDetectedBrowser === 'firefox' ?
		{'iceServers':[{'url':'stun:23.21.150.121'}]} : // number IP
		{'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]},
	//Peer connection constraints
	pc_constraints: {
		'optional': [
		    {'DtlsSrtpKeyAgreement': true},
			{'RtpDataChannels': true}
		]
	},
	// Set up audio and video regardless of what devices are present.
	sdpConstraints: {
		'mandatory': {
			'OfferToReceiveAudio':true,
			'OfferToReceiveVideo':true
		}
	},
	addNewVideo: function(videoElement) {
		jQuery("#videos").append(videoElement);
	},
	deleteVideo: function(videoElement) {
		
	}
});

var map = new Map({
	divMap: document.getElementById("carte"),
	localMember: function() {
		return AUTH.getMember();
	},
	showMap: function(mapElement) {
		jQuery(mapElement).css({
			height: "150px",
			width: "150px"
		});
	}
});

window.onbeforeunload = function(e){
	//sendMessage('bye');
	webrtc.hangup();
}

/////////////////////////////////////////////

// Permet d'indiquer une "room" dans le path
var room = location.pathname.substring(1);
if (room === '') {
//  room = prompt('Enter room name:');
  room = 'foo';
} else {
  //
}

// Demande de connexion au serveur de sockets. Si on regarde le code du
// server dans server.js on verra que si on est le premier client connecté
// on recevra un message "created", sinon un message "joined"
chatMessage.on('created', function (room){ // Si on reçoit le message "created" alors on est l'initiateur du call
	console.log('Created room ' + room);
	webrtc.setInitiator(true);
}).on('full', function (room){// On a essayé de rejoindre une salle qui est déjà pleine (avec deux personnes)
	console.log('Room ' + room + ' is full');
}).on('join', function (room){ // Jamais appelé, à mon avis une trace de la version nxn
	console.log('Another peer made a request to join room ' + room);
	console.log('This peer is the initiator of room ' + room + '!');
	webrtc.setChannelReady(true);
	map.sendPosition();
}).on('joined', function (room){// Si on reçoit le message "joined" alors on a rejoint une salle existante
								// on est pas l'initiateur, il y a déjà quelqu'un (l'appelant), donc
								// on est prêt à communiquer...
	console.log('This peer has joined room ' + room);
	webrtc.setChannelReady(true);
	console.log('Send my position');
	map.sendPosition();
}).on('log', function (array){ // Appelé par le serveur pour faire des traces chez les clients connectés
	console.log.apply(console, array);
}).on('messageChat', function(messageChat) {
	console.log("Receive a message by " + messageChat.user + ": " + messageChat.message);
	var val = jQuery("#dataChannelReceive").val();
	val += messageChat.user + " says: " + messageChat.message;
	jQuery("#dataChannelReceive").val(val);
}).on('refreshFileList', function (fileToRefresh) {
	// faire le refresh de la liste de fichiers git
});

//Envoi de message générique, le serveur broadcaste à tout le monde
//par défaut (ce sevrait être que dans la salle courante...)
//Il est important de regarder dans le code de ce fichier quand on envoit
//des messages.
function sendMessage(messageType, data){
	chatMessage.sendMessage(messageType, data);
}

jQuery("#sendButton").click(function () {
	var data = jQuery('#dataChannelSend').val();
	sendMessage('messageChat', {
		user: getMember(),
		message: data
	});
});

if (room !== '') {
  console.log('Create or join room', room);
  sendMessage('create or join', room);
}

////////////////////////////////////////////////

// Récépeiton de message générique.
/*socket.on('message', function (message){
  console.log('------------------ Received message:', message);
  console.log('------------------ Received messagetype:', message.type);


  if (message === 'got user media') {
    // On ouvre peut-être la connexion p2p
  	webrtc.maybeStart();
  } else if (message.type === 'offer') {

    if (!webrtc.isInitiator && !webrtc.isStarted) {
      // on a recu une "offre" on ouvre peut être la connexion so on
      // est pas appelant et si on ne l'a pas déjà ouverte...
      webrtc.maybeStart();
    }

    // si on reçoit une offre, on va initialiser dans la connexion p2p
    // la "remote Description", avec le message envoyé par l'autre pair 
    // (et recu ici)
    webrtc.getPC().setRemoteDescription(new RTCSessionDescription(message));

    // On envoie une réponse à l'offre.
    webrtc.doAnswer();
  } else if (message.type === 'answer' && webrtc.isStarted) {
    // On a reçu une réponse à l'offre envoyée, on initialise la 
    // "remote description" du pair.
	  webrtc.getPC().setRemoteDescription(new RTCSessionDescription(message));
  } else if (message.type === 'candidate' && webrtc.isStarted) {
    // On a recu un "ice candidate" et la connexion p2p est déjà ouverte
    // On ajoute cette candidature à la connexion p2p. 
    var candidate = new RTCIceCandidate({sdpMLineIndex:message.label,
      candidate:message.candidate});
    webrtc.getPC().addIceCandidate(candidate);
  } else if (message === 'bye' && webrtc.isStarted) {
	  webrtc.handleRemoteHangup();
  }
});*/