window.COURSES = {
	container : "course-form",
	log : function (array) {
		console.log.apply(console, array);
	},
	initialize : function(){

//		app.post(  '/manage/courses',        mod_db_courses.create);
//		app.get(   '/manage/courses',        mod_db_courses.list);
//		app.get(   '/manage/courses/:id',    mod_db_courses.get);
//		app.put(   '/manage/courses/:id',    mod_db_courses.update); 
//		app.delete('/manage/courses/:id',    mod_db_courses.remove);
		
		$("#" + COURSES.container + " #form").submit( COURSES.create );
		//
		//Tous les liens du container sont liés à l'action processHashLink
		//
		$("#" + COURSES.container + " a").click( COURSES.processHashLink );
		COURSES.list();
		$("#" + COURSES.container).show();
	},
	create : function(e) {
		var data = { 
				name : $("#" + COURSES.container + " #form #name").val(), 
				description : $("#" + COURSES.container + " #form #description").val() };
		$.post("/manage/courses", data , COURSES.creationComplete);
		e.preventDefault();
		return false;
	},
	creationComplete : function(data){
		if(data.newlyCreated){
			COURSES.list();
			$("#" + COURSES.container + " #info").text("course '"+ data.name +"' has been created");
		}
		else{
			$("##" + COURSES.container + " #info").text("course '"+ data.name +"' already exists");
		}
	},
	processHashLink : function(e){
		e.preventDefault();
		var hash = this.hash;
		if(hash.indexOf("=") > -1){
			hash = hash.substring(0,hash.indexOf("="));
		}
		switch(hash) {
		case "#refresh":
			COURSES.list(e);
		break;
		case "#course":
			//COURSES.get(e);
		break;
			default:
				//throw new Exception("Unhandled hash");
		}
		return false;
	},
	list : function(e) {
		var data = { };
		//
		//Il faudrait le token d'auth ici pour vérifier qu'on liste les cours à une personne authentifiée
		//
		$.get("/manage/courses", data , COURSES.listComplete);
	},
	listComplete : function(data){
		var list = $("<ul></ul>");
		$(data).each(function(index, value){
			var item = $("<li><a></a></li>");
			$("a", item).
			attr("href","#course=" + value.name).
			click(COURSES.processHashLink).
			text(value.name);
			list.append(item);
		});
		$("#" + COURSES.container + " #list").
		empty().
		append(list);
	}
};
