
var cors = require('cors');
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
var session = require('express-session');
var errorHandler = require('errorhandler');
var morgan = require('morgan');

var mod_routes = require('./routes'); 


//CORS middleware
/*
 * Pour régler le problème de l'url de turn demandée par WebRTC : pour l'instant refusée à cause des règles CORS
 * 	Normalement, une requete HTTP OPTIONS devrait être envoyée au serveur avant le GET vers turn qui foire mais je ne la vois jamais passer. 
 * Pas même depuis le vps, c'est ce qui m'a fait migrer vers express 4.0 mais ce n'est toujours pas suffisant. 
 * Reste que le tout est toujours fonctionnel donc c'est pas perdu !
 * 
 * https://hacks.mozilla.org/2009/07/cross-site-xmlhttprequest-with-cors/
 * http://www.sys-con.com/node/1415913
 * http://stackoverflow.com/questions/23991562/no-access-control-allow-origin-header-is-present-on-the-requested-resource-in
 * http://stackoverflow.com/questions/7067966/how-to-allow-cors-in-express-node-js
 * http://stackoverflow.com/questions/17441181/couchdb-jquery-ajax-post-cors
 * 
var enableCrossDomain = function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-max-age', '10');//'computeengineondemand.appspot.com');
	next();
}
 * 
 * 
var allowCrossDomain = function(req, res, next) {
	res.status(200);
	res.header('Access-Control-Allow-Origin', '*');//'computeengineondemand.appspot.com');
	res.header('Access-Control-Allow-Methods', 'GET,OPTIONS,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, accept, authorization, origin');
	res.header('Access-Control-Allow-Credentials', 'true');
	res.header('Access-Control-max-age', '10');
	
	next();
}*/

//Configuration générale
//
// Configuration migrée de express 3.0 vers 4.0, voir https://scotch.io/bar-talk/expressjs-4-0-new-features-and-upgrading-from-3-0
//
//	Tous les composants d'express sont maintenant des modules externes
//	dont https://www.npmjs.com/package/express-session
//
exports.config = function(app, express){

	// log every request to the console
	//
	app.use(morgan('tiny', {
		//skip: function (req, res) { return res.statusCode < 400 }
	})); 

	// Log les access web dans access.log
	//
	app.use(morgan('combined',{
		skip: function (req, res) { return res.statusCode < 400 },
		stream: fs.createWriteStream('logs/access.log', {flags: 'a'}) 
	}));
	
	// configure express to allow cross domain request ex : https://computeengineondemand.appspot.com/turn
	//
	app.use(cors());

	// parse application/x-www-form-urlencoded
	//
	app.use(bodyParser.urlencoded({ extended: false }))   

	// parse application/json
	//
	app.use(bodyParser.json())    
	app.use(cookieParser());

	// simulate DELETE and PUT
	//
	app.use(methodOverride());     

	app.use(session({ 
		secret: 'cool beans',
		/*
		 * resave
Forces the session to be saved back to the session store, even if the session was never modified during the request. 
Depending on your store this may be necessary, but it can also create race conditions where a client has two parallel requests to your server and changes made to the session in one request may get overwritten when the other request ends, even if it made no changes (this behavior also depends on what store you're using).

The default value is true, but using the default has been deprecated, as the default will change in the future. 
Please research into this setting and choose what is appropriate to your use-case. Typically, you'll want false.
		 * */
		resave: false,
		/*
		 *  saveUninitialized
Forces a session that is "uninitialized" to be saved to the store. 

A session is uninitialized when it is new but not modified. 
Choosing false is useful for implementing login sessions, reducing server storage usage, or complying with laws that require permission before setting a cookie. 
Choose false will also help with race conditions where a client makes multiple parallel requests without a session.

The default value is true, but using the default has been deprecated, as the default will change in the future. 
Please research into this setting and choose what is appropriate to your use-case.
		 * */
		saveUninitialized : false
	}));

	// set the static files location /public/img will be /img for users
	// NB : __dirname correspond au répertoire où se trouve ce fichier et on veut que la redirection par défaut pointe vers le contenu du répertoire public
	//
	app.use(express.static(path.resolve(__dirname, '../..') + "/public"));

	var env = process.env.NODE_ENV || 'development';
	if ('development' == env) {
		// configure stuff here
		// configuration pour l’environnement de developpement
		app.use(errorHandler({ dumpExceptions: false, showStack: false }));
	}
	else{
		// configuration pour l’environnement de production
		app.use(errorHandler());
	}

	mod_routes.setup(app);
};