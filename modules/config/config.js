
var cors = require('cors');
var fs = require('fs');
var path = require('path');


//Configuration générale
exports.config = function(app, express){
	// Express configuration
	app.configure(function(){
		// Log les access web
		app.use(express.logger({
			stream: fs.createWriteStream('logs/access.log', {flags: 'a'}) 
		}));
		// Permet de récupérer les variables envoyées en POST
		app.use(express.bodyParser());
		// Permet de monter par défaut les routes app.get(), app.post(), ...
		app.use(express.methodOverride());
		//
		// configure express to allow cross domain request ex : https://computeengineondemand.appspot.com/turn
		// ne fonctionne pas encore... à travailler
		//
		app.use(cors());
		app.use(app.router);
		//
		// NB : __dirname correspond au répertoire où se trouve ce fichier et on veut que la redirection par défaut pointe vers le contenu du répertoire public
		//
		app.use(express.static(path.resolve(__dirname, '../..') + "/public"));
		  //server.use('/media', express.static(__dirname + '/media'));

	});
	// configuration pour l’environnement de developpement
	app.configure('development', function(){
		app.use(express.errorHandler({ dumpExceptions: false, showStack: false }));
	});
	// configuration pour l’environnement de production
	app.configure('production', function(){
		app.use(express.errorHandler());
	});
};