
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

var chatMessage = new ChatMessage();