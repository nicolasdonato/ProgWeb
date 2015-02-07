/*
 * jsTree refs :
 * 	- http://stackoverflow.com/questions/6871698/parameters-of-jstree-create-node
 *  - http://www.jstree.com/api/
 *  - http://luban.danse.us/jazzclub/javascripts/jquery/jsTree/reference/_examples/2_operations.html
 *  - http://tkgospodinov.com/jstree-part-1-introduction/
 * 
 * 
 * */


/*
// jsTree : Expected format of the node (there are no required fields)
{
  id          : "string" // will be autogenerated if omitted
  text        : "string" // node text
  icon        : "string" // string for custom
  state       : {
    opened    : boolean  // is the node open
    disabled  : boolean  // is the node disabled
    selected  : boolean  // is the node selected
  },
  children    : []  // array of strings or objects
  li_attr     : {}  // attributes for the generated LI node
  a_attr      : {}  // attributes for the generated A node
}

 */
var Repository = Class.create({
	
	transmittedFiles : [],

	initialize : function(options){	
		
		$("#private-repository").jstree({
			core: {
				data : [ { id : "private-repository-root", text : "Fichiers privés", type : "racine"  } ],
				//
				// $.jstree.defaults.core.check_callback
				//
				//	determines what happens when a user tries to modify the structure of the tree
				//	If left as false all operations like create, rename, delete, move or copy are prevented.
				//
				'check_callback': true,
				"animation" : 0,
				"themes" : { "stripes" : true }
			},
			types : {
				//pour tout type de noeud, par défaut : icone dossier sauf si type précisé et lors de la création et icon ci-dessous qui va avec
//				"#" : {
//					"max_children" : 1, 
//					"max_depth" : 4, 
//					"valid_children" : ["root"]
//				},
				"racine" : { },
				"file" : {
					"icon" : "/images/File-20.png",
					"valid_children" : []
				}
			},
			plugins : ["types"] //, "dnd", "search", "state", "types", "wholerow"
		});

		$("#shared-repository").jstree({
			core: {
				data : [ { id : "shared-repository-root", text : "Fichiers partagés" } ],
				'check_callback': true,
				"animation" : 0,
				"themes" : { "stripes" : true }
			},
			types : {
				"file" : { "icon" : "/images/File-20.png" }
			},
			plugins : ["types"] 
		});

		$("#uploaded-files").jstree({
			core: {
				data : [ { id : "uploaded-files-root", text : "En transit" } ],
				'check_callback': true,
				"animation" : 0,
				"themes" : { "stripes" : true }
			},
			types : {
				"file" : { "icon" : "/images/File-20.png" }
			},
			plugins : ["types"] 
		});

		$("#repository").hide();
		$("#private-file-details").hide();	
	},

	
	initializeEvents : function(){

		$("#repository").bind('dragover', function(){return false;});
		$("#repository").bind('drop', function(e){

			e.preventDefault();  

			if("addFileToRepositoryStack" in this){
				this.addFileToRepositoryStack(e);
			}
			else{
				REPOSITORY.component.addFileToRepositoryStack.call( REPOSITORY.component, e);
			}
			return false;
		});
		
		//
		// Associer le handler showNodeDetails à la treeview privée sur l'ev select_node
		//
		$("#private-repository").bind("select_node.jstree", this.showNodeDetails);
	},

	addFileToRepositoryStack : function(e){

		e = e.originalEvent || e;

		var files = e.dataTransfer.files;

		for(var i = 0 , t = files.length ; i < t ; i++){
			var file = files[i];
			var id = this.addFileToRepository(file);
			
			var tree = $.jstree.reference("uploaded-files");

			var root = $("#uploaded-files-root" )[0];
			
			var data = {
				id : "upload_"+id,
				text : file.name,
				type : "file"
			};

			tree.create_node(root, data );
			/*var reader = new FileReader();  
            reader.onload = function (evt) {                
               console.log(evt.target.result);  
            }  
            reader.readAsText(file);  */
		}		
		tree.open_node($("#uploaded-files-root")[0]);
		tree.refresh_node( $("#uploaded-files-root")[0] );
	},


	addFileToRepository : function(file){
		this.transmittedFiles.push(file);

		var formData = new FormData();
		formData.append("localId", this.transmittedFiles.indexOf(file));
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
	
	
	cleanTree : function(treeId, refresh ){

		var tree = $.jstree.reference(treeId);
		
		tree.close_all();
		
		tree.select_all(true);
		
		tree.deselect_node( $("#" + treeId + "-root")[0]);

		tree.delete_node( tree.get_selected() );
		
		if( refresh ){
			tree.refresh();
		}
	},
	
	
	cleanTrees : function(){

		this.cleanTree("private-repository", true);
		this.cleanTree("shared-repository", true);
		this.cleanTree("uploaded-files", true);
		
	},


	repositoryUploadProgress : function(e) {
		if (e.success) {
			var tree = $.jstree.reference("uploaded-files");
			var localId = e.localId;
			if( "responseJSON" in e){
				localId = e.responseJSON.localId;
			}
			var node = $("#upload_" + localId )[0];
			var fileName = tree.get_text(node);
			tree.rename_node( node , fileName + " (en cours)" );			
			tree.open_node($("#uploaded-files-root")[0]);
			tree.refresh_node( node );
		}
	},


	repositoryUploadComplete : function(e) {
		/* This event is raised when the server send back a response */
		if (e.success) {
			var tree = $.jstree.reference("uploaded-files");
			var localId = e.localId;
			if( "responseJSON" in e){
				localId = e.responseJSON.localId;
			}
			//
			// supprimer le fichier du buffer d'attente
			//
			this.transmittedFiles.splice(localId, 1);
			
			var node = $("#upload_" + localId )[0];
			tree.delete_node( node );			
			tree.refresh();

			
			this.loadRepositoryWithDelay(300);
		}
	},


	repositoryUploadFailed : function(e) {
		alert("There was an error attempting to upload the file.");
	},


	repositoryUploadCanceled : function(e) {
		alert("The upload has been canceled by the user or the browser dropped the connection.");
	},
	
	
	loadRepositoryWithDelay : function( delay ){
		var that = this;
		//
		// on attend 100 ms pour être sur que les jstree sont créés
		//
		window.setTimeout(function(){
			that.loadRepository();
			$("#repository").show();
		}, delay);
	},


	loadRepository : function(){
		$.ajax({
			url 		: "/"+AUTH.session.token+"/repository",
			type 		: "SEARCH",
			contentType	: false,
			processData	: false,
			complete : function(e){   		        
				if("loadRepositoryComplete" in this){
					this.loadRepositoryComplete(e);
				}
				else{
					REPOSITORY.component.loadRepositoryComplete.call( REPOSITORY.component, e);
				}
			},
			fail : function(e){   		        
				if("loadRepositoryFailed" in this){
					this.loadRepositoryFailed(e);
				}
				else{
					REPOSITORY.component.loadRepositoryFailed.call( REPOSITORY.component, e);
				}
			}
		});
	},


	loadRepositoryComplete : function(info) {

		this.cleanTree("private-repository");

		if( "responseJSON" in info){
			
			var tree = $.jstree.reference("private-repository");

			var root = $("#private-repository-root" )[0];
			
			$(info.responseJSON.result).each(function(index, file ) {
				var data = {
					id : file.id,
					text : file.originalFilename,
					type : "file",
					data : file
				};
				//attr("href", "#get?id=" + course.id).click(COURSES.processHashLink).text(course.name);
				tree.create_node(root, data );

			});
			
			tree.open_all();
		}
	},


	loadRepositoryFailed : function(e) {

	},
	
	//
	// Affiche les détails d'un fichier sélectionné dans le repo privé
	//
	showNodeDetails : function( e, data){
		$("#private-file-details").hide();
		if( data.node.type == "file"){
			 $("#private-file-details-filename").text(data.node.data.originalFilename);
			 $("#private-file-details-owner").text(data.node.data.owner.login);
			 $("#private-file-details").show();
		}
	},


	connect 	: function(){
		
		this.loadRepositoryWithDelay(500);
		
	},


	disconnect 	: function(){
		 this.cleanTrees();
		 $("#repository").hide();
		 $("#private-file-details").hide();
	}

	/*
        uploadFinished:function(i,file,response){
        	$( "li", FILE_TRANSFER.uploadedFiles).empty().append(file.name +" OK");
            //$.data(file).addClass('done');
            // response is the JSON object that post_file.php returns
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
        	$("<li></li>").attr("id", id).append(file.name + " 0 %").appendTo(FILE_TRANSFER.uploadedFiles);
            //createImage(file);
        },

        progressUpdated: function(i, file, progress) {
        	$( "li", FILE_TRANSFER.uploadedFiles).empty().append(file.name + ' '+ progress + " %");
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
		

		initializeEvents : function(){
			REPOSITORY.component.initializeEvents();
		},
		
		
		connect : function(){
			REPOSITORY.component.connect();
		},
		
		
		disconnect : function(){
			REPOSITORY.component.disconnect();
		}

};