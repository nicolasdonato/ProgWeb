
var cors = require('cors');
var fs = require('fs');
var path = require('path');

var enableCrossDomain = function(req, res, next) {
	  res.header('Access-Control-Allow-Origin', '*');
	  res.header('Access-Control-max-age', '10');//'computeengineondemand.appspot.com');
	  next();
}

//Configuration générale
exports.config = function(app, express){
	// Express configuration
	app.configure(function(){
		// Log les access web
		app.use(express.logger({
			stream: fs.createWriteStream('logs/access.log', {flags: 'a'}) 
		}));
		/*app.use(function(req, res, next){
			next();
		});*/
		// Permet de récupérer les variables envoyées en POST
		app.use(express.bodyParser());
		app.use(express.cookieParser());
	    app.use(express.session({ secret: 'cool beans' }));
		// Permet de monter par défaut les routes app.get(), app.post(), ...
		app.use(express.methodOverride());
	    //app.options(allowCrossDomain);
	    //app.all('/*',enableCrossDomain);
		app.use(app.router);
		//
		// configure express to allow cross domain request ex : https://computeengineondemand.appspot.com/turn
		// ne fonctionne pas encore... à travailler
		//
		app.use(cors());
		//
		// NB : __dirname correspond au répertoire où se trouve ce fichier et on veut que la redirection par défaut pointe vers le contenu du répertoire public
		//
		app.use(express.static(path.resolve(__dirname, '../..') + "/public"));

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