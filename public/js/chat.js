
var ChatMessage = Class.create({
	socket: null,
	component: null,
	mapFunctionOn: null,
	
	initialize: function(options) {
		this.socket = io.connect();
		this.component = (options && options.component) ? options.component : "message";
		console.log('socket')
		this.socket.on(this.component, this.receiveMessage.bind(this));
		this.mapFunctionOn = {};
    },
	
	on: function (messageType, functionToExecute) {
		if (functionToExecute && jQuery.isFunction(functionToExecute)) {
			this.mapFunctionOn[messageType] = functionToExecute;
		}
		return this;
	},
    
	sendMessage: function(messageType, data) {
		var message = {
			type: messageType,
			data: data
		};
		console.log('Sending message: ', message);
		this.socket.emit(this.component, message);
		return this;
	},
	
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