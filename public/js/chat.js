
var ChatMessage = Class.create({
	socket: null,
	
	initialize: function(options) {
		this.socket = io.connect();
		this.socket.on("message", this.receiveMessage);
		this.socket.mapFunctionOn = {};
    },
	
	on: function (messageType, functionToExecute) {
		if (functionToExecute && jQuery.isFunction(functionToExecute)) {
			this.socket.mapFunctionOn[messageType] = functionToExecute;
		}
		return this;
	},
    
	sendMessage: function(messageType, data) {
		var message = {
			type: messageType,
			data: data
		};
		console.log('Sending message: ', message);
		this.socket.emit('message', message);
		return this;
	},
	
	receiveMessage: function(message) {
		console.log('------------------ Received message:', message);
		console.log('------------------ Received messagetype:', message.type);
		
		if (this.mapFunctionOn) {
			jQuery.each(this.mapFunctionOn, function(messageType, functionToExecute) {
				//console.log( messageType + ": " + functionToExecute );
				if (message.type === messageType
						&& jQuery.isFunction(functionToExecute)) {
					functionToExecute(message.data);
				}
			});
		}
	}
});

var chatMessage = new ChatMessage();