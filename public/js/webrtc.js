
var WebRTC = Class.create({
	
	webrtc: null,
	
	options: null,
	
	pc_config: null,
	pc_constraints: null,
	sdpConstraints: null,
	
	localStream: null, // stream of the local webcam
	localVideo: null,
	
	turnReady: false,
	isChannelReady: false,
	isInitiator: false, 
	isStarted: false,
	setChannelReady: function(isReady) { this.isChannelReady = isReady; },
    setInitiator: function(isInitiator) { this.isInitiator = isInitiator; },
	
	listPeerConnection: [],
	
	initialize: function(options) {
		
		this.webrtc = this;
		
		this.localVideo = options.localVideo;
		this.constraints = options.constraints || {
			video: true
		}
		this.pc_config = options.pc_config;
		this.pc_constraints = options.pc_constraints;
		this.sdpConstraints = options.sdpConstraints;
		
		this.options = options;
		
		getUserMedia(this.constraints, this.handleUserMedia, this.handleUserMediaError);
		console.log('Getting user media with constraints', this.constraints);
		
		// On regarde si on a besoin d'un serveur TURN que si on est pas en localhost
		if (location.hostname != "localhost") {
		  this.requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913');
		}
		
		return this;
    },
    
    handleUserMedia: function (stream) {
		this.webrtc.localStream = stream;
		attachMediaStream(this.webrtc.localVideo, stream);
		console.log('Adding local stream.');
		
		// On envoie un message à tout le monde disant qu'on a bien
		// overt la connexion video avec la web cam.
		sendMessage('got user media');
		
		// Si on est l'appelant on essaie d'ouvrir la connexion p2p
		if (this.webrtc.isInitiator) {
			this.webrtc.maybeStart();
		}
	},
	
	handleUserMediaError: function (error){
	  console.log('getUserMedia error: ', error);
	},
	
	// regarde si le serveur turn de la configuration de connexion
	// (pc_config) existe, sinon récupère l'IP/host d'un serveur
	// renvoyé par le web service computeengineondemand.appspot.com
	// de google. La requête se fait en Ajax, résultat renvoyé en JSON.
	requestTurn: function (turn_url) {
		var turnExists = false;
		for (var i in this.pc_config.iceServers) {
			if (this.pc_config.iceServers[i].url.substr(0, 5) === 'turn:') {
				turnExists = true;
				this.turnReady = true;
				break;
			}
		}
		if (!turnExists) {
			console.log('Getting TURN server from ', turn_url);
			// No TURN server. Get one from computeengineondemand.appspot.com:
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function(){
				if (xhr.readyState === 4 && xhr.status === 200) {
					var turnServer = JSON.parse(xhr.responseText);
					console.log('Got TURN server: ', turnServer);
					this.pc_config.iceServers.push({
						'url': 'turn:' + turnServer.username + '@' + turnServer.turn,
						'credential': turnServer.password
					});
					turnReady = true;
				}
			};
			xhr.open('GET', turn_url, true);
			xhr.send();
		}
	},
	
	// On démarre peut être l'appel (si on est appelant) que quand on a toutes les 
	// conditons. Si on est l'appelé on n'ouvre que la connexion p2p   
	// isChannelReady = les deux pairs sont dans la même salle virtuelle via websockets
	// localStream = on a bien accès à la caméra localement,
	// !isStarted = on a pas déjà démarré la connexion.
	// En résumé : on établit la connexion p2p que si on a la caméra et les deux
	// pairs dans la même salle virtuelle via WebSockets (donc on peut communiquer
	// via WebSockets par sendMessage()...)
	maybeStart: function () {
	  if (!this.isStarted && this.isChannelReady) {
				
		var nodePeerConnection = new WebRTCNode({
			webrtc: this,
			member: null,
			isInitiator: this.isInitiator,
			isStarted: this.isStarted
		});
		this.listPeerConnection.push(nodePeerConnection);
		  
	    // Ouverture de la connexion p2p
		this.createPeerConnection(nodePeerConnection);
	    // on donne le flux video local à la connexion p2p. Va provoquer un événement 
	    // onAddStream chez l'autre pair.
		if (this.webrtc && this.webrtc.localStream) { 
			nodePeerConnection.pc.addStream(this.localStream);
		}
	    // On a démarré, utile pour ne pas démarrer le call plusieurs fois
		this.isStarted = true;
	    // Si on est l'appelant on appelle. Si on est pas l'appelant, on ne fait rien.
	    if (this.webrtc && this.webrtc.isInitiator) {
	    	this.doCall(nodePeerConnection);
	    }
	  }
	},
	
	/////////////////////////////////////////////////////////
	
	createPeerConnection: function (nodePeerConnection) {
		try {
			// Ouverture de la connexion p2p
			nodePeerConnection.pc = new RTCPeerConnection(this.pc_config, this.pc_constraints);
			nodePeerConnection.pc.webrtc = this;
			
			// ecouteur en cas de réception de candidature
			nodePeerConnection.pc.onicecandidate = this.handleIceCandidate;
		
			console.log('Created RTCPeerConnnection with:\n' +
			'  config: \'' + JSON.stringify(this.pc_config) + '\';\n' +
			'  constraints: \'' + JSON.stringify(this.pc_constraints) + '\'.');
		} catch (e) {
			console.log('Failed to create PeerConnection, exception: ' + e.message);
			alert('Cannot create RTCPeerConnection object.');
			return;
		}
		
		// Ecouteur appelé quand le pair a enregistré dans la connexion p2p son stream vidéo.
		nodePeerConnection.pc.onaddstream = this.handleRemoteStreamAdded;
		
		// Ecouteur appelé quand le pair a retiré le stream vidéo de la connexion p2p
		nodePeerConnection.pc.onremovestream = this.handleRemoteStreamRemoved;
		
		// Data channel. Si on est l'appelant on ouvre un data channel sur la connexion p2p
		if (this.isInitiator) {
			try {
				// Reliable Data Channels not yet supported in Chrome
				var sendChannel = nodePeerConnection.pc.createDataChannel("sendDataChannel", {reliable: false});
				
				// écouteur de message reçus
				sendChannel.onmessage = this.handleMessage;
				sendChannel.webrtc = this;
				
				trace('Created send data channel');
				
				// ecouteur appelé quand le data channel est ouvert
				sendChannel.onopen = this.handleSendChannelStateChange;
				// idem quand il est fermé.
				sendChannel.onclose = this.handleSendChannelStateChange;
			} catch (e) {
				alert('Failed to create data channel. You need Chrome M25 or later with RtpDataChannel enabled');
				trace('createDataChannel() failed with exception: ' + e.message);
			}
		} else {
			// ecouteur appelé quand le pair a enregistré le data channel sur la connexion p2p
			nodePeerConnection.pc.nodePeerConnection = nodePeerConnection;
			nodePeerConnection.pc.ondatachannel = this.gotReceiveChannel;
		}
	},
	
	sendData: function (data) {
		this.pc.sendChannel.send(data);
		trace('Sent data by RTCPeerConnection: ' + data);
	},
	
	closeDataChannels: function() {
//		trace('Closing data channels');
//		sendChannel.close();
//		trace('Closed data channel with label: ' + sendChannel.label);
//		receiveChannel.close();
//		trace('Closed data channel with label: ' + receiveChannel.label);
//		localPeerConnection.close();
//		remotePeerConnection.close();
//		localPeerConnection = null;
//		remotePeerConnection = null;
//		trace('Closed peer connections');
//		startButton.disabled = false;
//		sendButton.disabled = true;
//		closeButton.disabled = true;
//		dataChannelSend.value = "";
//		dataChannelReceive.value = "";
//		dataChannelSend.disabled = true;
//		dataChannelSend.placeholder = "Press Start, enter some text, then press Send.";
	},
	
	//Le data channel est créé par l'appelant. Si on entre dans cet écouteur
	//C'est qu'on est l'appelé. On se contente de le récupérer via l'événement
	gotReceiveChannel: function (event) {
		trace('Receive Channel Callback');
		this.webrtc.sendChannel = event.channel;
		//this.webrtc.sendChannel.webrtc = this.webrtc;
		this.webrtc.sendChannel.onmessage = this.webrtc.handleMessage;
		this.webrtc.sendChannel.onopen = this.webrtc.handleReceiveChannelStateChange;
		this.webrtc.sendChannel.onclose = this.webrtc.handleReceiveChannelStateChange;
	},
	
	handleMessage: function (event) {
		trace('Received message: ' + event.data);
		receiveTextarea.value = event.data;
	},
	
	handleSendChannelStateChange: function(event) {
		var readyState = this.webrtc.pc.sendChannel.readyState;
		trace('Send channel state is: ' + readyState);
		//if (this.webrtc.enableMessageInterface)
		//	this.webrtc.enableMessageInterface(readyState == "open");
		this.webrtc.trigger("channelStateChange", {
			readyState: readyState == "open"
		});
	},
	
	handleReceiveChannelStateChange: function(event) {
		var readyState = this.webrtc.pc.sendChannel.readyState;
		trace('Receive channel state is: ' + readyState);
		//if (this.webrtc.enableMessageInterface)
		//	this.webrtc.enableMessageInterface(readyState == "open");
		this.webrtc.trigger("channelStateChange", {
			readyState: readyState == "open"
		});
	},
	
	handleIceCandidate: function (event) {
		// On a recu une candidature, c'est le serveur STUN qui déclenche l'event
		// quand il a réussi à déterminer le host/port externe.
		console.log('handleIceCandidate event: ', event);
		
		if (event.candidate) {
			// On envoie cette candidature à tout le monde.
			this.sendMessage({
				type: 'candidate',
				label: event.candidate.sdpMLineIndex,
				id: event.candidate.sdpMid,
				candidate: event.candidate.candidate
			});
		} else {
			console.log('End of candidates.');
		}
	},
	
	// Exécuté par l'appelant uniquement
	doCall: function(nodePeerConnection) {
		// M.Buffa : les contraintes et les configurations (SDP) sont encore 
		// supportées différements selon les browsers, et certaines propriétés du 
		// standard officiel ne sont pas encore supportées... bref, c'est encore
		// un peu le bazar, d'où des traitement bizarres ici par exemple...
		var constraints = {
				'optional': [],
				'mandatory': {
					'MozDontOfferDataChannel': true
				}
		};
		// temporary measure to remove Moz* constraints in Chrome
		if (webrtcDetectedBrowser === 'chrome') {
			for (var prop in constraints.mandatory) {
				if (prop.indexOf('Moz') !== -1) {
					delete constraints.mandatory[prop];
				}
			}
		}
		constraints = this.mergeConstraints(constraints, this.webrtc.sdpConstraints);
		console.log('Sending offer to peer, with constraints: \n' +	'  \'' + JSON.stringify(constraints) + '\'.');
	
		// Envoi de l'offre. Normalement en retour on doit recevoir une "answer"
		//nodePeerConnection.pc.createOffer(this.setLocalAndSendMessage, null, constraints);
		nodePeerConnection.pc.createOffer(function(offer) {
			// Set Opus as the preferred codec in SDP if Opus is present.
			// M.Buffa : là c'est de la tambouille compliquée pour modifier la 
			// configuration SDP pour dire qu'on préfère un codec nommé OPUS (?)
			sessionDescription.sdp = this.webrtc.preferOpus(sessionDescription.sdp);
			nodePeerConnection.pc.setLocalDescription(sessionDescription, function() {
			    // send the offer to a server to be forwarded to the friend you're calling.
				// Envoi par WebSocket
				sendMessage(sessionDescription);
		    });
			
		}, null, constraints);
	},
	
	// Exécuté par l'appelé uniquement...
	doAnswer: function() {
		console.log('Sending answer to peer.');
		this.pc.createAnswer(this.setLocalAndSendMessage, null, this.webrtc.sdpConstraints);
	},
	
	mergeConstraints: function (cons1, cons2) {
		var merged = cons1;
		for (var name in cons2.mandatory) {
			merged.mandatory[name] = cons2.mandatory[name];
		}
		merged.optional.concat(cons2.optional);
		return merged;
	},
	
	// callback de createAnswer et createOffer, ajoute une configuration locale SDP
	// A la connexion p2p, lors de l'appel de createOffer/answer par un pair.
	// Envoie aussi la description par WebSocket. Voir le traitement de la réponse
	// au début du fichier sans socket.on("message" , ...) partie "answer" et "offer"
	setLocalAndSendMessage: function (sessionDescription) {
		// Set Opus as the preferred codec in SDP if Opus is present.
		// M.Buffa : là c'est de la tambouille compliquée pour modifier la 
		// configuration SDP pour dire qu'on préfère un codec nommé OPUS (?)
		sessionDescription.sdp = this.webrtc.preferOpus(sessionDescription.sdp);
		this.webrtc.pc.setLocalDescription(sessionDescription);
		
		// Envoi par WebSocket
		sendMessage(sessionDescription);
	},
	
	// Ecouteur de onremotestream : permet de voir la vidéo du pair distant dans 
	// l'élément HTML remoteVideo
	handleRemoteStreamAdded: function (event) {
		console.log('Remote stream added.');
		// reattachMediaStream(miniVideo, localVideo);
		attachMediaStream(this.webrtc.remoteVideo, event.stream);
		this.webrtc.remoteStream = event.stream;
		//  waitForRemoteVideo();
	},
	
	handleRemoteStreamRemoved: function (event) {
		console.log('Remote stream removed. Event: ', event);
	},
	
	// bouton "on raccroche"
	hangup: function () {
		console.log('Hanging up.');
		this.stop();
		sendMessage('bye');
	},
	
	handleRemoteHangup: function () {
		var webrtctmp = this.webrtc || this;
		console.log('Session terminated.');
		webrtctmp.stop();
		webrtctmp.isInitiator = false;
	},
	
	// Fermeture de la connexion p2p
	stop: function() {
		this.isStarted = false;
		// isAudioMuted = false;
		// isVideoMuted = false;
		this.pc.close();
		this.pc = null;
	},
	
	///////////////////////////////////////////
	// M.Buffa : tambouille pour bidouiller la configuration sdp
	// pour faire passer le codec OPUS en premier....
	// 
	// Set Opus as the default audio codec if it's present.
	preferOpus: function(sdp) {
		var sdpLines = sdp.split('\r\n');
		var mLineIndex;
		// Search for m line.
		for (var i = 0; i < sdpLines.length; i++) {
			if (sdpLines[i].search('m=audio') !== -1) {
				mLineIndex = i;
				break;
			}
		}
		if (mLineIndex === null) {
			return sdp;
		}
		
		// If Opus is available, set it as the default in m line.
		for (i = 0; i < sdpLines.length; i++) {
			if (sdpLines[i].search('opus/48000') !== -1) {
				var opusPayload = this.extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
				if (opusPayload) {
					sdpLines[mLineIndex] = this.setDefaultCodec(sdpLines[mLineIndex], opusPayload);
				}
				break;
			}
		}
		
		// Remove CN in m line and sdp.
		sdpLines = this.removeCN(sdpLines, mLineIndex);
		sdp = sdpLines.join('\r\n');
		return sdp;
	},

	extractSdp: function (sdpLine, pattern) {
		var result = sdpLine.match(pattern);
		return result && result.length === 2 ? result[1] : null;
	},

	// Set the selected codec to the first in m line.
	setDefaultCodec: function(mLine, payload) {
		var elements = mLine.split(' ');
		var newLine = [];
		var index = 0;
		for (var i = 0; i < elements.length; i++) {
			if (index === 3) { // Format of media starts from the fourth.
				newLine[index++] = payload; // Put target payload to the first.
			}
			if (elements[i] !== payload) {
				newLine[index++] = elements[i];
			}
		}
		return newLine.join(' ');
	},

	// Strip CN from sdp before CN constraints is ready.
	removeCN: function(sdpLines, mLineIndex) {
		var mLineElements = sdpLines[mLineIndex].split(' ');
		// Scan from end for the convenience of removing an item.
		for (var i = sdpLines.length-1; i >= 0; i--) {
			var payload = this.extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
			if (payload) {
				var cnPos = mLineElements.indexOf(payload);
				if (cnPos !== -1) {
					// Remove CN payload from m line.
					mLineElements.splice(cnPos, 1);
				}
				// Remove CN line in sdp
				sdpLines.splice(i, 1);
			}
		}
		sdpLines[mLineIndex] = mLineElements.join(' ');
		return sdpLines;
	}
});

var WebRTCNode = Class.create({
	
	webrtc: null,
	
	pc: null, 
	remoteStream: null,
	remoteVideo: null,
	sendChannel: null,
	
	isStarted: false,
	isInitiator: false,
	
	member: null,
	
	initialize: function(options) {
		
		this.webrtc = options.webrtc || null;
		
		this.isInitiator = options.isInitiator || false;
		this.isStarted = false;
		
		this.member = options.member || null;
		
		
    }
});