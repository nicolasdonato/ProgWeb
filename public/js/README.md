# JavaScript Components

The different components in this folder are used to different works.
Each files in this following document use Socket.IO of the NodeJS server. 

To see all component initialization, see the file [main.js!](main.js)


## [chat.js](chat.js) File
### Description
Interface corresponding to the management of events and send/receive messages from the server via NodeJS SocketIO.

### Initialization of the component
Properties initialization
```js
var options = {
	component: "example_component" --> this property is optional, by default the component is 'message'
}
```
Initialization of the class. This class can be used for different component & binding message events (receiving message by the NodeJS server).
```js
var chatMessage = new ChatMessage(options)
	.on('created', function (room){
		// some actions
	})
	.on('full', function (room){
		// some actions
	})
	.on('join', function (room){
		// some actions
	});
```

### Implementation of the websocket event server
On the server, you must create event receiver for the messages:
```js
socket.on('example_component', function(message) {
	if (message.type === 'created or join') {
		// some actions for example
		var room = message.data;
		var numClients = io.sockets.clients(room).length;
		log('Room ' + room + ' has ' + numClients + ' client(s)');
		log('Request to create or join room', room);
		if (numClients == 0) {
			socket.join(room);
			socket.emit('message', { type: 'created', data: room });
		} else if (numClients <= 5) {
			io.sockets.in(room).emit('example_component', { type: 'join', data: room });
			socket.join(room);
			socket.emit('example_component', { type: 'joined', data: room });
		} else { 
			socket.emit('example_component', { type: 'full', data: room });
		}
	} else if (message.type === 'bye') {
		// some actions
	} else {
		logger.err('Unknown socket message type <' + message.type + '> for the example_component'); 
	}
});
```
This component is used by following component to encapsulate the event message and the interacts with the server.

### Public methods
Send message to NodeJS server using SocketIO
```js
chatMessage.sendMessage(messageType, data);
```

## [maps.js](maps.js) File
Manage the localization of all people in the chat room with the GoogleMaps API. This class uses the "Chat" class in the file chat.js.

### Initialization of the component
Options to use to initialize the class:
```js
{
 		divMap --> The HTML element which is used by the map of Google. The element is found for example by this code: document.querySelector('#divMap')
		showMap --> This property is filled with a function (callback) which is called by the class to show the map when the map is initialize.
		localMember --> The local member which opened the browser. This property can be an attribute or a function
}
```

Example:
```js
var map = new Map({
	divMap: document.getElementById("map"),
	localMember: function() {
		return getMember();
	},
	showMap: function(mapElement) {
		jQuery(mapElement).css({
			height: "150px",
			width: "150px"
		});
	}
});
```

### Implementation of the websocket event server
On the NodeJS Server, the developer must be implemented 2 events on the 'lane' 'geolocalisation_component'.
This event is:
 - 'geolocation' using when a chat member send their location properties
 - 'bye' using when a chat member close his browser
Example of code to use on the NodeJS server:
```js
socket.on('geolocalisation_component', function(message) {
	if (message.type === 'geolocation') {
		log('Got ' + message.type + ': ', message);
		socket.broadcast.emit('geolocalisation_component', message);
	} else if (message.type === 'bye') {
		log('Got ' + message.type + ': ', message);
		socket.broadcast.emit('geolocalisation_component', message);
	} else {
		logger.err('Unknown socket message type <' + message.type + '> for the geolocalisation_component'); 
	}
});
```

### Public methods
* Map#closeLocation(): Delete marker of local member on the remote map

## [webrtc.js](webrtc.js) File
Class using to display remote cams of people connected in the chat room.
It manages all of cams on the chat window of the user.
This class uses the "Chat" class in the file chat.js.

### Initialization of the component
Options to use to initialize the class:
```js
{
 		constraints --> constraint definitions for the HTML5 videos tag (using in the getUserMedia method)
 		pc_config --> Stun servers configuration...
 		pc_constraints --> Peer connection constraints
 		sdpConstraints --> Set up audio and video regardless of what devices are present.
 		localVideo --> fill the HTML5 video tag using for the local user cam
 		localMember --> fill the local user (can be use a function or a value)
		addNewVideo --> method to add remote video (remote cams) of other members of the room (can be create the html dom)
 		deleteVideo --> method to delete remote video (remote cams) of other members of the room (can be create the html dom)
}
```

Example:
```js
var webrtc = new WebRTC({
		constraints: {video: true},
		pc_config: webrtcDetectedBrowser === 'firefox' ?
			{'iceServers':[{'url':'stun:23.21.150.121'}]} : // IP number
			{'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]},
		pc_constraints: {
			'optional': [
		    	{'DtlsSrtpKeyAgreement': true},
				{'RtpDataChannels': true}
			]
		},
		sdpConstraints: {
			'mandatory': {
				'OfferToReceiveAudio':true,
				'OfferToReceiveVideo':true
			}
		},
		localVideo: document.querySelector('#localVideo'),
		localMember: function() {
			return getMember();
		},
		addNewVideo: function(event) {
			jQuery("#videos").append(event.remoteVideo);
		},
		deleteVideo: function(event) {
			jQuery(event.remoteVideo).remove();
		},
		enableDataChannel: function (event) {
			console.log("The DataChannel for the remote user '"+event.remoteMember+"' [remoteVideo: "+event.remoteVideo+"] is ready ["+event.readyState+"]");
		},
		receiveMessageByDataChannel: function (event) {
			console.log("The remote user '"+event.remoteMember+"' [remoteVideo: "+event.remoteVideo+"] sends a message ["+event.message+"]");
			FileTransfer.receiveFile(event);
		}
});
```

### NodeJS Event for the component
 On the NodeJS Server, the developer must be implemented 5 events on the 'lane' 'webrtc_component'.
 * This event is:
 
Example of code to use on the NodeJS server:
```js
socket.on('webrtc_component', function(message) {
	if (message.type === 'got user media') {		
		log('Got ' + message.type + ': ', message);
		// add the socket id of the sender. The socket id is 
		// used by the API to identify the remote user 
		// which sending the message and return an other message
		message.data.socketId = socket.id;
		socket.broadcast.emit('webrtc_component', message);
	} else if (message.type === 'offer') {	
		log('Got ' + message.type + ': ', message);
		// add the socket id of the sender. The socket id is 
		// used by the API to identify the remote user 
		// which sending the message and return an other message
		message.data.socketIdSender = socket.id;
		// send the message to the remote user sending an other message
		io.sockets.socket(message.data.socketIdReceiver).emit('webrtc_component', message);
	} else if (message.type === 'answer') {
		log('Got ' + message.type + ': ', message);
		// send the message to the remote user sending an other message
		io.sockets.socket(message.data.socketIdReceiver).emit('webrtc_component', message);	
	} else if (message.type === 'candidate') {
		log('Got ' + message.type + ': ', message);
		socket.broadcast.emit('webrtc_component', message);	
	} else if (message.type === 'bye') {
		log('Got ' + message.type + ': ', message);
		socket.broadcast.emit('webrtc_component', message);
	} else {
		logger.err('Unknown socket message type <' + message.type + '> for the webrtc_component'); 
	}
});
```

### Public methods
* WebRTC#hangup() - Lets stop the video stream to the other chat room users. Sends a message to other participants to delete the locale video (cam).
* WebRTC#sendDataByDataChannel(remoteMemberLogin#String, messageToSend#String) - Method used when the local user send a message by RTCDataChannel (P2P communication)
* WebRTC#getPC(remoteMemberLogin#String):WebRTCNode - Return an object containing different informations of the remote user like the remote login, the RTCPeerConnection, ...

### Send files by RTCDataChannel
To send files by RTCDataChannel, we use a library called [File.js](File.js) which cut the file by chunk and send the file pieces to the remote user.

#### Create the send and receive callback
We can create some callback for the receive and send the file :
```js
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
```
You can pair the issuance and file hostels' reception with WebRTC component as follows (in the WebRTC option initialization):
To receive file: in the receiveMessageByDataChannel callback, you can call the method FileTransfert.receiveFile
```js
receiveMessageByDataChannel: function (event) {
	console.log("The remote user '"+event.remoteMember+"' [remoteVideo: "+event.remoteVideo+"] sends a message ["+event.message+"]");
	FileTransfer.receiveFile(event);
}
```
To send file: in the send method (FileTransfert.sendFile), you can use the RTCDataChannel creating by the WebRTC component by using the method getPC(member#String) and use the "sendChannel" object
```js
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
```

#### Interact with the graphics
To interact with the DOM HTML, you must create a "FileHelper" producing changes:
```js
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
```
You must create these callback (like the previous example):
* onBegin(file#Object) - Executing when a file is sending
* onEnd(file#Object) - Executing when sending the file is finished
* onProgress(file#Object) - Executing when sending files of parts are sent