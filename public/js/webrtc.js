//https://opentokrtc.com

//ou plutot ce lien il y a tout dessus --> https://github.com/muaz-khan/WebRTC-Experiment/ 

/**
 * Class using to display remote cams of people connected in the chat room.
 * It manages all of cams on the chat window of the user.
 * This class uses the socket event with NodeJS socket and encapsulates the WebRTC API of the W3C consortium.
 * 
 * Options to use to initialize the class: {
 * 		constraints --> constraint definitions for the HTML5 videos tag (using in the getUserMedia method)
 * 		pc_config --> Stun servers configuration...
 * 		pc_constraints --> Peer connection constraints
 * 		sdpConstraints --> Set up audio and video regardless of what devices are present.
 * 		localVideo --> fill the HTML5 video tag using for the local user cam
 * 		localMember --> fill the local user (can be use a function or a value)
 * 		addNewVideo --> method to add remote video (remote cams) of other members of the room (can be create the html dom)
 * 		deleteVideo --> method to delete remote video (remote cams) of other members of the room (can be create the html dom)
 * }
 * 
 * Example: var options = {
 *		constraints: {video: true},
 *		pc_config: webrtcDetectedBrowser === 'firefox' ?
 *			{'iceServers':[{'url':'stun:23.21.150.121'}]} : // IP number
 *			{'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]},
 *		pc_constraints: {
 *			'optional': [
 *		    	{'DtlsSrtpKeyAgreement': true},
 *				{'RtpDataChannels': true}
 *			]
 *		},
 *		sdpConstraints: {
 *			'mandatory': {
 *				'OfferToReceiveAudio':true,
 *				'OfferToReceiveVideo':true
 *			}
 *		},
 *		localVideo: document.querySelector('#localVideo'),
 *		localMember: function() {
 *			return getMember();
 *		},
 *		addNewVideo: function(event) {
 *			jQuery("#videos").append(event.remoteVideo);
 *		},
 *		deleteVideo: function(event) {
 *			jQuery(event.remoteVideo).remove();
 *		}
 * }
 * 
 * On the NodeJS Server, the developer must be implemented 5 events on the 'lane' 'webrtc_component'.
 * This event is:
 * 
 * Example of code to use on the NodeJS server:
 * 	socket.on('webrtc_component', function(message) {
 *		if (message.type === 'got user media') {		
 *			log('Got ' + message.type + ': ', message);
 *			// add the socket id of the sender. The socket id is 
 *			// used by the API to identify the remote user 
 *			// which sending the message and return an other message
 *			message.data.socketId = socket.id;
 *			socket.broadcast.emit('webrtc_component', message);
 *		} else if (message.type === 'offer') {	
 *			log('Got ' + message.type + ': ', message);
 *			// add the socket id of the sender. The socket id is 
 *			// used by the API to identify the remote user 
 *			// which sending the message and return an other message
 *			message.data.socketIdSender = socket.id;
 *			// send the message to the remote user sending an other message
 *			io.sockets.socket(message.data.socketIdReceiver).emit('webrtc_component', message);
 *		} else if (message.type === 'answer') {
 *			log('Got ' + message.type + ': ', message);
 *			// send the message to the remote user sending an other message
 *			io.sockets.socket(message.data.socketIdReceiver).emit('webrtc_component', message);	
 *		} else if (message.type === 'candidate') {
 *			log('Got ' + message.type + ': ', message);
 *			socket.broadcast.emit('webrtc_component', message);	
 *		} else if (message.type === 'bye') {
 *			log('Got ' + message.type + ': ', message);
 *			socket.broadcast.emit('webrtc_component', message);
 *		} else {
 *			logger.err('Unknown socket message type <' + message.type + '> for the webrtc_component'); 
 *		}
 *	});
 */
var WebRTC = Class.create({

	// Socket related component dedicated to communication with the server NodeJS
	socketWebrtc: null,

	// Options initialization 
	options: null,

	// Peer configuration
	pc_config: null,
	// Peer constraints
	pc_constraints: null,
	// SDP Constraints
	sdpConstraints: null,

	// stream of the local webcam
	localStream: null,
	// video of the local webcam
	localVideo: null,
	// member of the local webcam
	localMember: null,

	// can say if the WebRTC used the stun server
	turnReady: false,
	// can say if the WebRTC channel is ready
	isChannelReady: false, setChannelReady: function(isReady) { this.isChannelReady = isReady; },
	// can say if the local member is the initiator of the chat room
	isInitiator: false, setInitiator: function(isInitiator) { this.isInitiator = isInitiator; },
	// can say if the WebRTC is started
	isStarted: false,

	// list of all PeerConnection with other members (remote members)
	listPeerConnection: [],

	// method used to add video tag in the DOM
	addNewVideo: null,
	// method used to delete video tag in the DOM
	deleteVideo: null,
	// method used when the datachannel is enable/disable
	enableDataChannel: null,
	// method used when the user send a message by datachannel
	receiveMessageByDataChannel: null,

	/**
	 * Initialization of the class
	 */
	initialize: function(options) {

		this.localMember = options.localMember;
		this.localVideo = options.localVideo;
		this.constraints = options.constraints || {
			video: true
		}
		this.pc_config = options.pc_config;
		this.pc_constraints = options.pc_constraints;
		this.sdpConstraints = options.sdpConstraints;

		this.addNewVideo = options.addNewVideo || null;
		this.deleteVideo = options.deleteVideo || null;
		this.enableDataChannel = options.enableDataChannel || null;
		this.receiveMessageByDataChannel = options.receiveMessageByDataChannel || null;

		this.options = options;

		this.createEventTask();

		// fill the local stream in the HTML DOM
		getUserMedia(this.constraints, this.handleUserMedia.bind(this), this.handleUserMediaError.bind(this));
		console.log('Getting user media with constraints', this.constraints);

		// It is checked whether there is a need of a TURN server if it is not in localhost
		if (location.hostname != "localhost") 
		{
			this.requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913');
		}

		return this;
	},

	/**
	 * Callback used by the getUserMedia when the locale stream is founded
	 */
	handleUserMedia: function (stream) {
		this.localStream = stream;
		if (this.localVideo) {
			// attach the video to the video tag
			attachMediaStream(this.localVideo, stream);
		}
		console.log('Adding local stream.');

		// It sends a message to everyone saying that the video has overt connection to the web cam.
		this.sendMessageWebRtc('got user media', {
			memberSender: (this.localMember && jQuery.isFunction(this.localMember)) ? this.localMember() : this.localMember,
					isInitiatorOfTheConnection: true
		});
	},

	/**
	 * Callback used by the getUserMedia when the locale stream is NOT founded
	 */
	handleUserMediaError: function (error){
		console.log('getUserMedia error: ', error);
	},

	/**
	 * See if the turn server connection configuration (pc_config) exists,
	 * otherwise grab the IP/host of a server returned by the web service
	 * computeengineondemand.appspot.com google.
	 * The request is made in Ajax, JSON result returned.
	 */
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
			$.ajax({ 
				type:'GET',
				url : turn_url, 
				crossDomain: true,
				xhrFields: {
					withCredentials: true
				},
				dataType : "json"
			}).done(function(data){
				var turnServer = data;//JSON.parse(xhr.responseText);
				console.log('Got TURN server: ', turnServer);
				this.pc_config.iceServers.push({
					'url': 'turn:' + turnServer.username + '@' + turnServer.turn,
					'credential': turnServer.password
				});
				turnReady = true;
			});
		}
	},

	/////////////////////////////////////////////////////////
	// Event Task
	/////////////////////////////////////////////////////////
	/**
	 * Create the different event tasks to interact with the NodeJS server by socket.io
	 */
	createEventTask: function() {
		this.socketWebrtc = new ChatMessage({
			component: "webrtc_component"
		});
		this.socketWebrtc.on('got user media', (function(data) {
			// Perhaps opening the p2p connection
			console.log('Got user message and start the webrtc');
			this.maybeStart(data);
		}).bind(this)).on('offer', (function(data) {
			console.log('Receive offer by Socket IO [data: '+data+']');
			if (!data.isInitiatorOfTheConnection) {
				// it has received an "offer" is opened can be connected
				// so on is calling and if you did not already open ...
				this.maybeStart(data);
			}

			// If it receives an offer, we will boot into the p2p connection
			// "Remote Description" with the message sent by the other peer
			// (and received by)
			this.setRemoteDescription(data);

			// We send a response to the offer
			this.doAnswer(data);
		}).bind(this)).on('answer', (function(data) {
			console.log('Receive answer by Socket IO [data: '+data+']');
			if (this.isStarted) {
				// We received a response to the offer sent,
				// it initializes the "remote description" peer.
				this.setRemoteDescription(data);
			}
		}).bind(this)).on('candidate', (function(data) {
			if (this.isStarted) {
				// It has received an "ice candidate" and p2p connection is already open.
				// This application is added to the p2p connection.
				var candidate = new RTCIceCandidate({sdpMLineIndex:data.label,
					candidate:data.candidate});
				this.getPC(data.memberSender).pc.addIceCandidate(candidate);
			}
		}).bind(this)).on('bye', (function(data) {
			if (this.isStarted) {
				this.handleRemoteHangup(data);
			}
		}).bind(this));
	},

	/**
	 * send a message to the server with the component message of this class
	 */
	sendMessageWebRtc: function(messageType, data) {
		this.socketWebrtc.sendMessage(messageType, data);
	},

	/**
	 * We can start the call (if you are calling) than when it was all conditons.
	 * If one is called is opened only connection p2p isChannelReady = both peers
	 * are in the same virtual room via websockets localStream = we have access to
	 * the camera locally, !IsStarted = has not already started the connection.
	 * Summary: p2p connection is established only if it has the camera and the
	 * two peers in the same virtual room via WebSockets (so we can communicate
	 * via WebSockets by sendMessage () ...)
	 */
	maybeStart: function (data) {
		if (this.isChannelReady) {

			var nodePeerConnection = new WebRTCNode({
				webrtc: this,
				member: data.memberSender,
				isStarted: this.isStarted,
				remoteSocketId: data.socketId
			});
			this.listPeerConnection.push(nodePeerConnection);

			// Open peer connection
			this.createPeerConnection(nodePeerConnection);
			// we give the local video stream to the p2p connection.
			// Will cause onAddStream event in the other hand.
			if (this.localStream) { 
				nodePeerConnection.pc.addStream(this.localStream);
			}
			// We started useful not to start the call several times
			this.isStarted = true;
			if (data.isInitiatorOfTheConnection) {
				this.doCall(nodePeerConnection);
			}
		}
	},

	/////////////////////////////////////////////////////////
	// RTCPeerConnection
	/////////////////////////////////////////////////////////

	/**
	 * Create the PeerConnection with the remote user
	 */
	createPeerConnection: function (nodePeerConnection) {
		try {
			// Opening of the p2p connection
			nodePeerConnection.pc = new RTCPeerConnection(this.pc_config, this.pc_constraints);
			nodePeerConnection.pc.nodePeerConnection = nodePeerConnection;

			// earphone in the case of applications received
			nodePeerConnection.pc.onicecandidate = this.handleIceCandidate.bind(this);

			console.log('Created RTCPeerConnnection with:\n' +
					'  config: \'' + JSON.stringify(this.pc_config) + '\';\n' +
					'  constraints: \'' + JSON.stringify(this.pc_constraints) + '\'.');
		} catch (e) {
			console.log('Failed to create PeerConnection, exception: ' + e.message);
			alert('Cannot create RTCPeerConnection object.');
			return;
		}

		// Earpiece called when the pair recorded in the video stream p2p connection.
		nodePeerConnection.pc.onaddstream = this.handleRemoteStreamAdded.bind(this);

		// Earpiece called when the peer has removed the video stream of the p2p connection
		nodePeerConnection.pc.onremovestream = this.handleRemoteStreamRemoved.bind(this);

		// Data channel. If the caller is opening a data channel on the p2p connection
		this.initDataChannel(nodePeerConnection);
	},

	/**
	 * Earpiece of onremotestream: To see the video of the remote peer in the HTML element remoteVideo
	 */
	handleRemoteStreamAdded: function (event) {
		console.log('Remote stream added.');

		var remoteVideo = document.createElement("video");
		remoteVideo.autoplay = true;
		attachMediaStream(remoteVideo, event.stream);

		// fill the nodePeerConnection for the remote user
		event.target.nodePeerConnection.remoteStream = event.stream;
		event.target.nodePeerConnection.remoteVideo = remoteVideo;

		if (this.addNewVideo && jQuery.isFunction(this.addNewVideo)) {
			this.addNewVideo({
				remoteVideo: remoteVideo,
				member: event.target.nodePeerConnection.member
			});
		}
	},

	/**
	 * Earpiece of onremotestream: To remove the video of the remote peer in the HTML element remoteVideo
	 */
	handleRemoteStreamRemoved: function (event) {
		console.log('Remote stream removed. Event: ', event);
	},

	/**
	 * Get the PeerConnection of the remote user
	 */
	getPC: function(member) {
		if (this.listPeerConnection) {
			for (var idx = 0; idx < this.listPeerConnection.length; idx++) {
				var tmpPC = this.listPeerConnection[idx];
				if (tmpPC && tmpPC.member == member) {
					return tmpPC;
				}
			}
		}
		return null;
	},

	//////////////////////////////////////////

	/**
	 * We received a nomination, the STUN server that triggers the event when he was able to determine the host / external port.
	 */
	handleIceCandidate: function (event) {
		console.log('handleIceCandidate event: ', event);

		if (event.candidate) {
			this.sendMessageWebRtc('candidate', {
				type: 'candidate',
				label: event.candidate.sdpMLineIndex,
				id: event.candidate.sdpMid,
				candidate: event.candidate.candidate,
				memberSender: (this.localMember && jQuery.isFunction(this.localMember)) ? this.localMember() : this.localMember
			});
		} else {
			console.log('End of candidates.');
		}
	},

	/**
	 * Executed by the appellant only
	 */
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
		constraints = this.mergeConstraints(constraints, this.sdpConstraints);
		console.log('Sending offer to peer, with constraints: \n' +	'  \'' + JSON.stringify(constraints) + '\'.');

		// Sending the offer. Normally in return you will receive an "answer"
		nodePeerConnection.pc.createOffer((function(sessionDescription) {
			// Set Opus as the preferred codec in SDP if Opus is present.
			// M.Buffa : là c'est de la tambouille compliquée pour modifier la 
			// configuration SDP pour dire qu'on préfère un codec nommé OPUS (?)
			sessionDescription.sdp = this.preferOpus(sessionDescription.sdp);
			nodePeerConnection.pc.setLocalDescription(sessionDescription);
			// Send by socket
			var localMember = jQuery.isFunction(this.localMember) ? this.localMember() : this.localMember;
			this.sendMessageWebRtc('offer', {
				remoteSessionDescription: sessionDescription,
				memberSender: localMember,
				socketIdSender: this.socketWebrtc.id,
				memberReceiver: nodePeerConnection.member,
				socketIdReceiver: nodePeerConnection.remoteSocketId,
				isInitiatorOfTheConnection: false
			});

		}).bind(this), function(err) {
			console.log('An error has occured when send an offer: ' + err);
		}, constraints);
	},

	/**
	 * Set the remote description of the remote member
	 */
	setRemoteDescription: function(data) {
		var tmpPC = this.getPC(data.memberSender);
		if (tmpPC) {
			tmpPC.pc.setRemoteDescription(new RTCSessionDescription(data.remoteSessionDescription));
		}
	},

	/**
	 * Executed by the only known ...
	 */
	doAnswer: function(data) {
		console.log('Sending answer to peer.');
		var tmpPC = this.getPC(data.memberSender);
		if (tmpPC) {
			tmpPC.pc.createAnswer((function(sessionDescription) {
				// Set Opus as the preferred codec in SDP if Opus is present.
				// M.Buffa : là c'est de la tambouille compliquée pour modifier la 
				// configuration SDP pour dire qu'on préfère un codec nommé OPUS (?)
				sessionDescription.sdp = this.preferOpus(sessionDescription.sdp);
				tmpPC.pc.setLocalDescription(sessionDescription);
				// send by socket
				var localMember = jQuery.isFunction(this.localMember) ? this.localMember() : this.localMember;
				console.log('Sending answer to peer.');
				this.sendMessageWebRtc('answer', {
					remoteSessionDescription: sessionDescription,
					memberSender: localMember,
					socketIdSender: data.socketIdReceiver,
					memberReceiver: data.memberSender,
					socketIdReceiver: data.socketIdSender,
				});

			}).bind(this), function(err) {
				console.log('An error has occured when send an answer: ' + err);
			}, this.sdpConstraints);
		}
	},

	mergeConstraints: function (cons1, cons2) {
		var merged = cons1;
		for (var name in cons2.mandatory) {
			merged.mandatory[name] = cons2.mandatory[name];
		}
		merged.optional.concat(cons2.optional);
		return merged;
	},

	///////////////////////////////////////////
	//////// Channel //////////////////////////
	///////////////////////////////////////////


	initDataChannel: function (nodePeerConnection) {
		if (!nodePeerConnection.isInitiator) {
			try {
				// Reliable Data Channels not yet supported in Chrome
				var sendChannel = nodePeerConnection.pc.createDataChannel("sendDataChannel", {reliable: false});
				nodePeerConnection.sendChannel = sendChannel;

				// écouteur de message reçus
				nodePeerConnection.sendChannel.onmessage = this.handleMessage.bind(nodePeerConnection);

				trace('Created send data channel');

				// ecouteur appelé quand le data channel est ouvert
				nodePeerConnection.sendChannel.onopen = this.handleSendChannelStateChange.bind(nodePeerConnection);
				// idem quand il est fermé.
				nodePeerConnection.sendChannel.onclose = this.handleSendChannelStateChange.bind(nodePeerConnection);
			} catch (e) {
				alert('Failed to create data channel. You need Chrome M25 or later with RtpDataChannel enabled');
				trace('createDataChannel() failed with exception: ' + e.message);
			}
		} else {
			// ecouteur appelé quand le pair a enregistré le data channel sur la connexion p2p
			nodePeerConnection.pc.ondatachannel = this.gotReceiveChannel.bind(nodePeerConnection);
		}
	},

	closeDataChannels: function(sendChannel) {
		trace('Closing data channels');
		sendChannel.close();
		trace('Closed data channel with label: ' + sendChannel.label);
	},

	//Le data channel est créé par l'appelant. Si on entre dans cet écouteur
	//C'est qu'on est l'appelé. On se contente de le récupérer via l'événement
	gotReceiveChannel: function (event) {
		trace('Receive Channel Callback');
		sendChannel = event.channel;
		sendChannel.onmessage = this.webrtc.handleMessage;
		sendChannel.onopen = this.webrtc.handleReceiveChannelStateChange;
		sendChannel.onclose = this.webrtc.handleReceiveChannelStateChange;
	},

	handleSendChannelStateChange: function(event) {
		this.sendChannel.push = this.sendChannel.send;
		this.sendChannel.send = (function (data) {
			this.push(JSON.stringify(data));
		}).bind(this.sendChannel);

		var readyState = this.sendChannel.readyState;
		trace('Send channel state is: ' + readyState);
		if (this.webrtc.enableDataChannel)
			this.webrtc.enableDataChannel({
				readyState: readyState == "open",
				remoteMember: this.member,
				remoteVideo: this.remoteVideo
			});
	},

	handleReceiveChannelStateChange: function(event) {
		var readyState = this.sendChannel.readyState;
		trace('Receive channel state is: ' + readyState);
		if (this.webrtc.enableDataChannel)
			this.webrtc.enableDataChannel({
				readyState: readyState == "open",
				remoteMember: this.member,
				remoteVideo: this.remoteVideo
			});
	},

	/**
	 * method used when the user send a message by datachannel
	 */
	handleMessage: function (event) {
		trace('Received message: ' + event.data);

		var data = JSON.parse(event.data);
		var eventCallback = jQuery.extend({
			remoteMember: this.member,
			remoteVideo: this.remoteVideo
			//message: data.message
		}, data);
		if (this.webrtc.receiveMessageByDataChannel) {
			this.webrtc.receiveMessageByDataChannel(eventCallback);
		}
	},

	/**
	 * method used when the user send a message by datachannel
	 * @param member the member which the data is send
	 * @param data the data to send
	 */
	sendDataByDataChannel: function (member, message) {
		var data = {
				message: message
		};
		this.getPC(member).sendChannel.send(data);
		trace('Sent data by RTCPeerConnection: ' + data);
	},

	///////////////////////////////////////////
	//////// Stop /////////////////////////////
	///////////////////////////////////////////

	// bouton "on raccroche"
	/**
	 * Lets stop the video stream to the other chat room users.
	 * Sends a message to other participants to delete
	 * the locale video (cam)
	 */
	hangup: function () {
		console.log('Hanging up.');
		if (this.listPeerConnection) {
			for (var idx = 0; idx < this.listPeerConnection.length; idx++) {
				var tmpPC = this.listPeerConnection[idx];
				if (tmpPC) {
					this.stop(tmpPC);
				}
			}
		}
		this.sendMessageWebRtc('bye', {
			member: jQuery.isFunction(this.localMember) ? this.localMember() : this.localMember
		});
	},

	/**
	 * Callback called when a remote user send the message 'bye' indicating that the remote user is offline
	 * In more, the remote video is deleted in the HTML Dom 
	 */
	handleRemoteHangup: function (data) {
		console.log('Session terminated.');
		var node = this.getPC(data.member);
		if (node) {
			this.stop(node);
			if (this.deleteVideo && jQuery.isFunction(this.deleteVideo)) {
				this.deleteVideo({
					remoteVideo: node.remoteVideo,
					member: data.member
				});
			}
			this.listPeerConnection.pop(node);
		}
	},

	/**
	 * Closing the p2p connection
	 */
	stop: function(node) {
		// this.isStarted = false;
		// isAudioMuted = false;
		// isVideoMuted = false;
		this.closeDataChannels(node.sendChannel); // TODO an error has occured when the RTCDataChannel is closing
		node.pc.close();
		node.pc = null;
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

/**
 * Node used for retrieving data related to the remote client
 */
var WebRTCNode = Class.create({

	// the WebRTC instance
	webrtc: null,

	// hte PeerConnection with the remote member
	pc: null,
	// remote stream
	remoteStream: null,
	// remote video (HTML video tag)
	remoteVideo: null,
	// socket id of the remote member
	remoteSocketId: null,
	// the RTCChannel using to send data to the remote member
	sendChannel: null,
	// the remote member
	member: null,

	/**
	 * Initialization of the class
	 */
	initialize: function(options) {

		this.webrtc = options.webrtc || null;
		this.member = options.member || null;
		this.remoteSocketId = options.remoteSocketId || null;
	}
});