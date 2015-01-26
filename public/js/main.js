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
		var tagToAdd = jQuery("<div></div>")
						.addClass("cam")
						.append("<p>" + event.member + "</p>")
						.append(event.remoteVideo);
		jQuery("#cams").append(tagToAdd);
	},
	deleteVideo: function(event) {
		jQuery(event.remoteVideo).parent().remove();
	},
	enableDataChannel: function (event) {
		console.log("The DataChannel for the remote user '"+event.remoteMember+"' [remoteVideo: "+event.remoteVideo+"] is ready ["+event.readyState+"]");
	},
	receiveMessageByDataChannel: function (event) {
		console.log("The remote user '"+event.remoteMember+"' [remoteVideo: "+event.remoteVideo+"] sends a message ["+event.message+"]");
	}
});

// Map initialization 
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

/////////////////////////////////////////
// File sharing events
//

//var progressHelper = {};
//var outputPanel = document.body;
//
//var fileHelper = {
//    onBegin: function (file) {
//        var div = document.createElement('div');
//        div.title = file.name;
//        div.innerHTML = '&lt;label&gt;0%&lt;/label&gt; &lt;progress&gt;&lt;/progress&gt;';
//        outputPanel.insertBefore(div, outputPanel.firstChild);
//        progressHelper[file.uuid] = {
//            div: div,
//            progress: div.querySelector('progress'),
//            label: div.querySelector('label')
//        };
//        progressHelper[file.uuid].progress.max = file.maxChunks;
//    },
//    onEnd: function (file) {
//        progressHelper[file.uuid].div.innerHTML = '&lt;a href="' + file.url + '" target="_blank" download="' + file.name + '"&lt;' + file.name + '&lt;/a&gt;';
//    },
//    onProgress: function (chunk) {
//        var helper = progressHelper[chunk.uuid];
//        helper.progress.value = chunk.currentPosition || chunk.maxChunks || helper.progress.max;
//        updateLabel(helper.progress, helper.label);
//    }
//};
//
//function updateLabel(progress, label) {
//    if (progress.position == -1) return;
//    var position = +progress.position.toFixed(2).split('.')[1] || 100;
//    label.innerHTML = position + '%';
//}
//
//// To Send a File
//File.Send({
//    file: file,
//    channel: peer,
//    interval: 100,
//    chunkSize: 1000, // 1000 for RTP; or 16k for SCTP
//                     // chrome's sending limit is 64k; firefox' receiving limit is 16k!
//
//    onBegin: fileHelper.onBegin,
//    onEnd: fileHelper.onEnd,
//    onProgress: fileHelper.onProgress
//});
//
//// To Receive a File
//var fleReceiver = new File.Receiver(fileHelper);
//peer.onmessage = function (data) {
//    fleReceiver.receive(data);
//};


/////////////////////////////////////////
// Window events
//

/*
 * Used when the user close the chat window
 */
window.onbeforeunload = function(e){
	//sendMessage('bye');
	webrtc.hangup();
	map.closeLocation();
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
		map.sendPosition();
	})
	// If you receive the message "joined" then joined an existing room.
	// We are not the initiator, there is already someone (the appellant),
	// so it is ready to communicate ...
	.on('joined', function (room){
		console.log('This peer has joined room ' + room);
		webrtc.setChannelReady(true);
		console.log('Send my position');
		map.sendPosition();
	})
	// Called by the server to make tracks in the connected clients
	.on('log', function (array){
		console.log.apply(console, array);
	})
	
	.on('messageChat', function(messageChat) {
		console.log(messageChat)
		console.log("Receive a message by " + messageChat.user + ": " + messageChat.message);
		if (jQuery("#dataChannelReceive").length > 0) {
			var outChat = jQuery("#dataChannelReceive");
			var val = outChat.val();
			val += messageChat.user + " says: " + messageChat.message;
			outChat.val(val);
		} else {
			console.log('il est temps de printer')
			$('#out').append(messageChat.user + ' : ' + messageChat.message + '<br>');
		}
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

jQuery("#sendButton").click(function () {
	var data;
	var inputChat = jQuery('#dataChannelSend');
	if (inputChat && inputChat.length > 0) {
		data = inputChat.val();
	} else {
		data = jQuery("#in").val();
	}
	if (data) {
		sendMessage('messageChat', {
			user: AUTH.getMember(),
			message: data
		});
	}
});

$('#in').on('keyup', function(e) {
	if ($(this).val() !== '' && e.keyCode === 13) {
		$('#out').append('me : ' + $(this).val() + '<br>');
		sendMessage('messageChat', {
			user: AUTH.getMember(),
			message: $(this).val()
		});
		$('#out').scrollTop($('#out')[0].scrollHeight);
		return $(this).val('');
	}
});


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
