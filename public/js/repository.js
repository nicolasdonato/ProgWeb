var Repository = Class.create({

	transmittedFiles : [],
	
	repositoryFiles : null,
	
	initialize : function(options){
		/*this.divMap = options.divMap || null;*/

		this.repositoryFiles = $("#repository-files");
		
		$("#repository").bind('dragover', function(){return false;});
		$("#repository").bind('drop', function(e){
			
	        e.preventDefault();  
	        
			if("addFileToRepositoryStack" in this){
				this.addFileToRepositoryStack(e);
			}
			else{
				REPOSITORY.component.addFileToRepositoryStack.call( REPOSITORY.component, e);
			}
		});
		$("#files").hide();
	},
	
	
	addFileToRepositoryStack : function(e){
        
        e = e.originalEvent || e;
        
        var files = e.dataTransfer.files;
        
        for(var i = 0, t = files.length ; i < t ; i++){
        	var file = files[i];
        	var id = this.addFileToRepository(file);
        	$("<li></li>").attr("id", id).append(file.name).appendTo(this.repositoryFiles);
            /*var reader = new FileReader();  
            reader.onload = function (evt) {                
               console.log(evt.target.result);  
            }  
            reader.readAsText(file);  */
        }
	},
	
	
	addFileToRepository : function(file){
		this.transmittedFiles.push(file);

   		var formData = new FormData();
   		formData.append("file", file);
   		
   		$.ajax({
   			url 		: "/"+AUTH.session.token+"/repository",
   			type 		: "POST",
   	        data		: formData,
   	        contentType	: false,
   	        processData	: false,
   	        success : function(e){   		        
   				if("repositoryUploadProgress" in this){
   					this.repositoryUploadProgress(e);
   				}
   				else{
   					REPOSITORY.component.repositoryUploadProgress.call( REPOSITORY.component, e);
   				}
   			},
   			complete : function(e){   		        
   				if("repositoryUploadComplete" in this){
   					this.repositoryUploadComplete(e);
   				}
   				else{
   					REPOSITORY.component.repositoryUploadComplete.call( REPOSITORY.component, e);
   				}
   			},
   			fail : function(e){   		        
   				if("repositoryUploadFailed" in this){
   					this.repositoryUploadFailed(e);
   				}
   				else{
   					REPOSITORY.component.repositoryUploadFailed.call( REPOSITORY.component, e);
   				}
   			},
   			abord : function(e){   		        
   				if("repositoryUploadCanceled" in this){
   					this.repositoryUploadCanceled(e);
   				}
   				else{
   					REPOSITORY.component.repositoryUploadCanceled.call( REPOSITORY.component, e);
   				}
   			}
   		});
   		
		return this.transmittedFiles.indexOf(file);
	},


	repositoryUploadProgress : function(e) {
	  if (e.lengthComputable) {
	    var percentComplete = Math.round(e.loaded * 100 / e.total);
	   // document.getElementById('progressNumber').innerHTML = percentComplete.toString() + '%';
		  alert("uploadProgress.lengthComputable");
	  }
	  else {
	   // document.getElementById('progressNumber').innerHTML = 'unable to compute';
		  alert("uploadProgress");
	  }
	},

	
	repositoryUploadComplete : function(e) {
	  /* This event is raised when the server send back a response */
	  alert('uploadComplete ');
	},

	
	repositoryUploadFailed : function(e) {
	  alert("There was an error attempting to upload the file.");
	},

	
	repositoryUploadCanceled : function(e) {
	  alert("The upload has been canceled by the user or the browser dropped the connection.");
	},
	
	
	connect 	: function(){
		$("#files").show();
		
	},
	
	
	disconnect 	: function(){
		$("#files").hide();
	}

	/*
	$("#repository").filedrop({
        // The name of the $_FILES entry:
        paramname:'file',

        maxfiles: 5,
    	maxfilesize: 2, // in mb
        url: '/repository',

        uploadFinished:function(i,file,response){
        	$( "li", FILE_TRANSFER.repositoryFiles).empty().append(file.name +" OK");
            //$.data(file).addClass('done');
            // response is the JSON object that post_file.php returns
        },

    	error: function(err, file) {
            switch(err) {
                case 'BrowserNotSupported':
                    showMessage('Your browser does not support HTML5 file uploads!');
                    break;
                case 'TooManyFiles':
                    alert('Too many files! Please select 5 at most!');
                    break;
                case 'FileTooLarge':
                    alert(file.name+' is too large! Please upload files up to 2mb.');
                    break;
                default:
                    break;
            }
        },

        // Called before each upload is started
        beforeEach: function(file){
            if(!file.type.match(/^image\//)){
                alert('Only images are allowed!');

                // Returning false will cause the
                // file to be rejected
                return false;
            }
        },

        uploadStarted:function(i, file, len){
    		FILE_TRANSFER.transmittedFiles.push(file);
        	$("<li></li>").attr("id", id).append(file.name + " 0 %").appendTo(FILE_TRANSFER.repositoryFiles);
            //createImage(file);
        },

        progressUpdated: function(i, file, progress) {
        	$( "li", FILE_TRANSFER.repositoryFiles).empty().append(file.name + ' '+ progress + " %");
            //$.data(file).find('.progress').width(progress);
        }

    });*/
});

window.REPOSITORY = {
	component : null,

	initialize : function(){
		REPOSITORY.component = new Repository({
			/*options*/
		});
	},
	connect : function(){
		REPOSITORY.component.connect();
	},
	disconnect : function(){
		REPOSITORY.component.disconnect();
	}
		
};