
/**
 * Interface corresponding to the management of events and send/receive messages from the server via NodeJS SocketIO
 * 
 * Initialization of this component:
 * 	var options = {
 * 		component: "example_component" --> this property is optional, by default the component is 'message'
 * 	}
 * 
 * On the server, you must create event receiver for the messages:
 * 	socket.on('example_component', function(message) {
 *		if (message.type === 'created or join') {
 *			// some actions for example
 *			var room = message.data;
 *			var numClients = io.sockets.clients(room).length;
 *			log('Room ' + room + ' has ' + numClients + ' client(s)');
 *			log('Request to create or join room', room);
 *			if (numClients == 0) {
 *				socket.join(room);
 *				socket.emit('message', { type: 'created', data: room });
 *			} else if (numClients <= 5) {
 *				io.sockets.in(room).emit('example_component', { type: 'join', data: room });
 *				socket.join(room);
 *				socket.emit('example_component', { type: 'joined', data: room });
 *			} else { 
 *				socket.emit('example_component', { type: 'full', data: room });
 *			}
 *		} else if (message.type === 'bye') {
 *			// some actions
 *		} else {
 *			logger.err('Unknown socket message type <' + message.type + '> for the example_component'); 
 *		}
 *	});
 * 
 * If you want use this interface you can use this example:
 *  - To receive message by the SocketIO api:
 * 		var chatMessage = new ChatMessage(options)
 *			.on('created', function (room){
 *				// some actions
 *			})
 *			.on('full', function (room){
 *				// some actions
 *			})
 *			.on('join', function (room){
 *				// some actions
 *			});
 *
 * - To send message to the SocketIO api:
 * 		chatMessage.sendMessage(messageType, data);
 * 
 */
var ChatMessage = Class.create({
	socket: null,

	/**
	 * The component which is this class is initialized
	 */
	component: null,

	/**
	 * The event binding for the different messages of SocketIO
	 */
	mapFunctionOn: null,

	/**
	 * Initialize method
	 */
	initialize: function(options) {
		this.socket = io.connect();
		this.component = (options && options.component) ? options.component : "message";
		console.log('socket')
		this.socket.on(this.component, this.receiveMessage.bind(this));
		this.mapFunctionOn = {};
	},

	/**
	 * Method which binding the event message
	 */
	on: function (messageType, functionToExecute) {
		if (functionToExecute && jQuery.isFunction(functionToExecute)) {
			this.mapFunctionOn[messageType] = functionToExecute;
		}
		return this;
	},

	/**
	 * Send the message to SocketIO
	 */
	sendMessage: function(messageType, data) {
		var message = {
				type: messageType,
				data: data
		};
		console.log('Sending message: ', message);
		this.socket.emit(this.component, message);
		return this;
	},

	/**
	 * Method callback executed by the SocketIO api by event message
	 */
	receiveMessage: function(message) {
		console.log('------------------ Received message:', message);
		console.log('------------------ Received messagetype:', message.type);

		if (this.mapFunctionOn) {
			jQuery.each(this.mapFunctionOn, function(messageType, functionToExecute) {
				if (message.type === messageType
						&& jQuery.isFunction(functionToExecute)) {
					functionToExecute(message.data);
				}
			});
		}
	}
});


//
//<<< Refactoring encapsulation >>>
//
//	avant : var chatMessage dans main.js 
//	après : window.CHAT.component
//
window.CHAT = {
		
	component	: null,
	
	initialize 	: function(){
		/////////////////////////////////////////
		// Chat component initialization
		//

		// init the chat socket and define the different events
		CHAT.component = new ChatMessage().
		// Connection request to the socket server. Looking at the server code
		// in server.js we will see that if you are the first customer is 
		// connected will receive a message "created", otherwise the message "joined"

		// If you receive the message "created" when it is the initiator of the call
		on('created', function (room){
			console.log('Created room ' + room);
			WEB_RTC_NODE.component.webrtc.setInitiator(true);
		}).
		// We tried to get a room that is already full
		on('full', function (room){
			console.log('Room ' + room + ' is full');
		}).
		// Called when an other user join the chat room
		on('join', function (room){
			console.log('Another peer made a request to join room ' + room);
			console.log('This peer is the initiator of room ' + room + '!');
			WEB_RTC_NODE.component.webrtc.setChannelReady(true);
			//non testé : GEOCHAT_MAP.map.sendPosition();
		}).
		// If you receive the message "joined" then joined an existing room.
		// We are not the initiator, there is already someone (the appellant),
		// so it is ready to communicate ...
		on('joined', function (room){
			console.log('This peer has joined room ' + room);
			WEB_RTC_NODE.component.webrtc.setChannelReady(true);
			console.log('Send my position');
			//non testé : GEOCHAT_MAP.map.sendPosition();
		}).
		// Called by the server to make tracks in the connected clients
		on('log', function (array){
			console.log.apply(console, array);
		}).

		on('messageChat', function(messageChat) {
			GEOCHAT_VIEW.writeChat(messageChat.user, messageChat.message);
		}).
		// do refresh the GitHub file list
		on('refreshFileList', function (fileToRefresh) {
			console.log('Refresh the Gitub file list');
		});

	},
	
	
	connect 	: function(){
		$("#geochat").show();
		
	},
	
	
	disconnect 	: function(){
		$("#geochat").hide();
	},

	
	/*
	 * Sending generic message, the server broadcasted to all members of the room.
	 */
	sendMessage : function(messageType, data){
		CHAT.component.sendMessage(messageType, data);
	}
};




