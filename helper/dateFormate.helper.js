const moment = require('moment');

//return current timestamp in milli seconds
exports.setCurrentTimestamp = function(){
    return moment().format("x");
}

//return current timestamp in seconds
exports.setCurrentTimestampInSeconds = function(){
    return moment().format("X");
}

exports.getDateFormatFromTimeStamp = function(dt){
    return moment.unix(dt/1000).format("MM/DD/YYYY HH:mm:ss")    
}

//add time to current timestamp
exports.addTimeToCurrentTimestamp = function(number,timeformat){
    return moment().add(number,timeformat).format("x");
}