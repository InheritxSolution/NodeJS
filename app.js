
require('rootpath')();
var express = require('express');
var http = require('http');
var path = require('path');
var connection = require('express-myconnection');
var session = require('express-session');
var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var jwt= require("jsonwebtoken");
var app = express();
var apiRoutes =express.Router();
var multer = require('multer');
const Config = require('./config/config'); 
var mysql = require('mysql');
url = require('url');

app.set('port', process.env.PORT || 4300);
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}
app.use(function(req, res, next) {
    // res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'Accept,X-Requested-With,x-xsrf-token,content-type,x-access-token');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());


require('controllers/common.controller')({app: app});
require('controllers/user.controller')({app: app});


app.use('/api', app.router);
app.use('/api/image', require('controllers/image.controller'));

var connection; 
function handleDisconnect() {
    connection = mysql.createConnection(Config.database); // Recreate the connection, since
    connection.connect(function(err) {              // The server is either down
        if(err) {                                     // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
        }                                     // to avoid a hot loop, and to allow our node script to
    });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
    connection.on('error', function(err) {
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect();                         // lost due to either server restart, or a
        } else {    
            handleDisconnect();                // connnection idle timeout (the wait_timeout
            //throw err;                                  // server variable configures this)
        }
    });
}

handleDisconnect();

var server = http.createServer(app);
server.listen(app.get('port'));
