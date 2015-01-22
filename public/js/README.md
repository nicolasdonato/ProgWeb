# JavaScript Components

The different components in this folder are used to different works.
Each files in this following document use Socket.IO of the NodeJS server. 


## chat.js File
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

## maps.js File
Manage the localization of all people in the chat room with the GoogleMaps API.

### Initialization of the component
Options to use to initialize the class: {
 		divMap --> The HTML element which is used by the map of Google. The element is found for example by this code: document.querySelector('#divMap')
		showMap --> This property is filled with a function (callback) which is called by the class to show the map when the map is initialize.
		localMember --> The local member which opened the browser. This property can be an attribut or a function
}

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
On the NodeJS Server, the developper must be implemented 2 events on the 'lane' 'geolocalisation_component'.
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
* closeLocation: Delete marker of local member on the remote map

## webrtc.js File
### Description
### Initialization of the component
### NodeJS Event for the component
### Implementation of the websocket event server