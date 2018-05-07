var mysql      = require('mysql');
const Config = require('./config');

//checking database connection
var connection = mysql.createConnection(Config.database);
connection.connect(function(err){
if(!err) {
    console.log("Database is connected");
} else {
    console.log("Error while connecting with database");
}
});
module.exports = connection;