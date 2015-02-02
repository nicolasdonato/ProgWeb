'use strict';

/////////////////////////////////////////
// Objects initialization
//

// WebRTC Initialization
var webrtc = new WebRTC({
	// constraint definitions
	constraints: {video: true},
	// Stun servers configuration...
	pc_config: webrtcDetectedBrowser === 'firefox' ?
		{'iceServers':[{'url':'stun:23.21.150.121'}]} : // IP number
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
	localVideo: document.querySelector('#localVideo'),
	localMember: function() {
		return AUTH.getMember();
	},
	addNewVideo: function(event) {
		view.addVideo(event.member, event.remoteVideo);
	},
	deleteVideo: function(event) {
		jQuery(event.remoteVideo).parent().remove();
	},
	enableDataChannel: function (event) {
		console.log("The DataChannel for the remote user '"+event.remoteMember+"' [remoteVideo: "+event.remoteVideo+"] is ready ["+event.readyState+"]");
	},
	receiveMessageByDataChannel: function (event) {
		console.log("The remote user '"+event.remoteMember+"' [remoteVideo: "+event.remoteVideo+"] sends a message ["+event.message+"]");
		FileTransfer.receiveFile(event);
	}
});

// Map initialization 
var map = new Map({
	divMap: document.getElementById("carte"),
	localMember: function() {
		return AUTH.getMember();
	},
	showMap: function(mapElement) {
		var el = jQuery(mapElement);

		el.css({
			height: "100%"
		});

		this.map.setOptions({
			disableDefaultUI: true,
			zoomControl: true
		});

		// TODO
		// 		panControl: boolean,
		// 		mapTypeControl: boolean,
		// 		scaleControl: boolean,
		// 		streetViewControl: boolean,
		// 		overviewMapControl: boolean

		// el.find('#carte img[src*="google_white"]')
		// 	.parent()
		// 	.parent()
		// 	.parent()
		// 	.css('background-color', 'red');

		// el.find('#carte .gmnoprint div:contains(Données)').remove();
		// el.find('#carte .gmnoprint span:contains(Données)').remove();
		// el.find('#carte .gmnoprint a:contains(Données)').remove();
		// el.find('#carte .gmnoprint a:contains(Conditions)').remove();

		// a = el.find('#carte').children('.gmstyle').children('div:first-child').clone();
		// a = el.find('#carte').children('.gmstyle').children('div:last-child').clone();

		// el.find('#carte .gmstyle div').remove();
		// el.find('#carte .gmstyle').append(a);
		// el.find('#carte .gmstyle').append(b);
	}
});

/////////////////////////////////////////
// File sharing events
//

var progressHelper = {};
var outputPanel = document.body;

// FileHelper with different methods which fill progress data into
// the dom and a link when the sending is finished
var fileHelper = {
    onBegin: function (file) {
        var div = document.createElement('div');
        div.title = file.name;
        div.innerHTML = '<label>0%</label> <progress></progress>';
        outputPanel.insertBefore(div, outputPanel.firstChild);
        progressHelper[file.uuid] = {
            div: div,
            progress: div.querySelector('progress'),
            label: div.querySelector('label')
        };
        progressHelper[file.uuid].progress.max = file.maxChunks;
    },
    onEnd: function (file) {
    	progressHelper[file.uuid].div.innerHTML = '<a href="' + file.url + '" target="_blank" download="' + file.name + '">' + file.name + '</a>';
    },
    onProgress: function (chunk) {
        var helper = progressHelper[chunk.uuid];
        helper.progress.value = chunk.currentPosition || chunk.maxChunks || helper.progress.max;
        
        if (helper.progress.position == -1) return;
        var position = +helper.progress.position.toFixed(2).split('.')[1] || 100;
        helper.label.innerHTML = position + '%';
    }
};

// Class permit to send and receive file. It encapsulates methods of File.js
var FileTransfer = {
	// To Send a File
	sendFile: function (member, file) {
		var peer = webrtc.getPC(member);
		if (peer) {
			File.Send({
			    file: file,
			    channel: peer.sendChannel,
			    interval: 100,
			    chunkSize: 100,//1000, // 1000 for RTP; or 16k for SCTP
			                     // chrome's sending limit is 64k; firefox' receiving limit is 16k!
			
			    onBegin: fileHelper.onBegin,
			    onEnd: fileHelper.onEnd,
			    onProgress: fileHelper.onProgress
			});
		}
	},

	// To Receive a File
	fileReceiver: new File.Receiver(fileHelper),
	receiveFile: function (data) {
		this.fileReceiver.receive(data);
	}
};

/////////////////////////////////////////
// Window events
//

/*
 * Used when the user close the chat window
 */
window.onbeforeunload = function(e){
	//sendMessage('bye');
	webrtc.hangup();
//	map.closeLocation();
}

/////////////////////////////////////////
// Chat component initialization
//

// init the chat socket and define the different events
var chatMessage = new ChatMessage()
	// Connection request to the socket server. Looking at the server code
	// in server.js we will see that if you are the first customer is 
	// connected will receive a message "created", otherwise the message "joined"

	// If you receive the message "created" when it is the initiator of the call
	.on('created', function (room){
		console.log('Created room ' + room);
		webrtc.setInitiator(true);
	})
	// We tried to get a room that is already full
	.on('full', function (room){
		console.log('Room ' + room + ' is full');
	})
	// Called when an other user join the chat room
	.on('join', function (room){
		console.log('Another peer made a request to join room ' + room);
		console.log('This peer is the initiator of room ' + room + '!');
		webrtc.setChannelReady(true);
//		map.sendPosition();
	})
	// If you receive the message "joined" then joined an existing room.
	// We are not the initiator, there is already someone (the appellant),
	// so it is ready to communicate ...
	.on('joined', function (room){
		console.log('This peer has joined room ' + room);
		webrtc.setChannelReady(true);
		console.log('Send my position');
//		map.sendPosition();
	})
	// Called by the server to make tracks in the connected clients
	.on('log', function (array){
		console.log.apply(console, array);
	})
	
	.on('messageChat', function(messageChat) {
		view.writeChat(messageChat.user, messageChat.message);
	})
	// do refresh the GitHub file list
	.on('refreshFileList', function (fileToRefresh) {
		console.log('Refresh the Gitub file list');
	});

/*
 * Sending generic message, the server broadcasted to all members of the room.
 */
function sendMessage(messageType, data){
	chatMessage.sendMessage(messageType, data);
}

/////////////////////////////////////////
// Visual interactions & DOM events
//

//add member name to the local video
jQuery('#localMember').text(AUTH.getMember());


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

// initialization of the room or join the room
if (room !== '') {
  console.log('Create or join room', room);
  sendMessage('create or join', room);
}

////////////////////////////////////////////////
// these 2 functions are called resp. after successfull login and logout
//
var globalInitialization = function(){
	window.COURSES.initialize();
};

var globalDisconnect = function(){
	window.COURSES.disconnect(); 	
};

