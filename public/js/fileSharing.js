

/////////////////////////////////////////
// File sharing events
//
var FileHelper = Class.create({
	
	progressHelper : {},
	
	outputPanel : document.body,
	
    onBegin: function (file) {
       /* var div = document.createElement('div');
        div.title = file.name;
        div.innerHTML = '<label>0%</label> <progress></progress>';
        this.outputPanel.insertBefore(div, this.outputPanel.firstChild);
        this.progressHelper[file.uuid] = {
            div: div,
            progress: div.querySelector('progress'),
            label: div.querySelector('label')
        };
        this.progressHelper[file.uuid].progress.max = file.maxChunks;*/
    },
    onEnd: function (file) {
    	//this.progressHelper[file.uuid].div.innerHTML = '<a href="' + file.url + '" target="_blank" download="' + file.name + '">' + file.name + '</a>';
    },
    onProgress: function (chunk) {
       /* var helper = this.progressHelper[chunk.uuid];
        helper.progress.value = chunk.currentPosition || chunk.maxChunks || helper.progress.max;
        
        if (helper.progress.position == -1) return;
        var position = +helper.progress.position.toFixed(2).split('.')[1] || 100;
        helper.label.innerHTML = position + '%';*/ad
    }
});

// Class permit to send and receive file. It encapsulates methods of File.js

//
//<<< Refactoring encapsulation >>>
//
//	avant : var FileTransfer dans main.js 
//	après : window.FILE_TRANSFER
//

window.FILE_TRANSFER = {
		
	helper : null,

	// To Receive a File
	fileReceiver: null,
		
	initialize : function(){
		FILE_TRANSFER.helper = new FileHelper();
		FILE_TRANSFER.fileReceiver = new File.Receiver(FILE_TRANSFER.helper);
	},
	
		
	// To Send a File
	sendFile: function (member, file) {
		var peer = WEB_RTC_NODE.component.webrtc.getPC(member);
		if (peer) {
			File.Send({
			    file		: file,
			    channel		: peer.sendChannel,
			    interval	: 100,
			    chunkSize	: 100,//1000, // 1000 for RTP; or 16k for SCTP
			                     // chrome's sending limit is 64k; firefox' receiving limit is 16k!
			
			    onBegin		: FILE_TRANSFER.helper.onBegin,
			    onEnd		: FILE_TRANSFER.helper.onEnd,
			    onProgress	: FILE_TRANSFER.helper.onProgress
			});
		}
	},
	
	
	receiveFile: function (data) {
		this.fileReceiver.receive(data);
	},
	
	
	connect 	: function(){
		$("#files").show();
		
	},
	
	
	disconnect 	: function(){
		$("#files").hide();
	}
};
