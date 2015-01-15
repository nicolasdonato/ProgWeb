
// PARAMETERS
/////////////

var portNumber = 8888;

var path = __dirname;
path = path.indexOf('\\') >= 0 ? path.replace(/\\/g, '/') : path; //change windows slashes to unix
if (path.substr(path.length - 1) == '/') { //remove trailing slash
    path = path.substr(0, path.length - 1);
} 
var tabDir = path.split("/");
var contextRoot = tabDir[tabDir.length - 1];

// MODULES
//////////

var node_express = require('express');
var node_http = require('http');
var node_io = require('socket.io'); 

var mod_config = require('./modules/config/config'); 
var mod_routes = require('./modules/config/routes'); 
var mod_db = require('./modules/db/manager'); 
var mod_db_connect = require('./modules/db/connection'); 
var mod_socket = require('./modules/sockets/manager');
var mod_socket_auth = require('./modules/sockets/authentification');
var mod_git = require('./modules/git/manager'); 


var logger = require('./modules/logger'); 
logger.reset(); 

logger.out('SERVER LAUNCHING'); 


// SERVER
/////////

mod_db_connect.initialize(contextRoot); //mod_db_connect.initialize("GEOCHAT");
mod_db.initialize();

var app = node_express();
mod_config.config(app, node_express);
mod_routes.setup(app);

var server = node_http.createServer(app);

server.listen(portNumber);


// SOCKET
/////////

var io = node_io.listen(server);

mod_socket.connect(io); 
mod_socket_auth.configure(io, "/auth");


// REPOSITORY
/////////////

mod_git.initialize(io); 
mod_git.refresh(); 


logger.out('SERVER RUNNING'); 

