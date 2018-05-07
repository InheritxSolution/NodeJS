var _ = require('lodash');
const Jwt = require('jsonwebtoken');
const Config = require('../config/config');
const privateKey = Config.key.privateKey;
var Q = require('q');
var mysql = require('mysql');
var bcrypt = require('bcrypt');
var pool  = mysql.createPool(Config.database);
const tokenService = require('./devicetoken.service');

// var connection = mysql.createConnection(Config.database);
var service = {};
service.signin = signin;
service.signup = signup;
service.changepassword = changepassword;
service.getUserProfile = getUserProfile;
service.updateUser = updateUser;
service.adminupdateUser = adminupdateUser;
service.socailSignup = socailSignup;
service.socialSignin = socialSignin;
service.checkEmail = checkEmail;

module.exports = service;

/**
 * user normal register
 */
function signup(data){
    var deferred = Q.defer();
    pool.getConnection(function(err, connection) {
        if(err) { 
          console.log(err); 
          callback(true); 
          return; 
        }
        //checking user is new or already exist in database
        var query = connection.query('SELECT * FROM users WHERE status=1 AND is_deleted=0 AND email = ? ',[data.email], function (err, results, fields) {
            if (err) {
                deferred.reject(err);
            }else{
                if(results.length >0){
                    connection.release();
                    var result = {
                        status:false,
                        message:"This user is already exists."
                    };
                    deferred.resolve(result);
                }
                else{
                    var today = new Date();
                    var tokenData={
                        user_id:results.insertId,
                        device_token:data.device_token,
                        device_type:parseInt(data.device_type),
                        created_at:today,
                        updated_at:today,

                    }
                    delete data['device_token'];
                    delete data['device_type'];
                    // insert user into database
                    connection.query('INSERT INTO users SET ?',data, function (error, results, fields) {
                        connection.release();
                        if (error) {
                            deferred.reject(err);
                        }else{

                            if(results){
                                tokenData.user_id=results.insertId
                                tokenService.addToken(tokenData)
                                .then(function(user) {
                                    if (user) {
                                        var tokenData = {
                                            email: data.email,
                                            id: results.insertId
                                        };
                                        var result = {
                                            status:true,
                                            token: Jwt.sign(tokenData, privateKey),
                                            user_name:data.user_name
                                        };
                                    } else {
                                        res.sendStatus(404);
                                    }
                                    deferred.resolve(result);
                                })
                                .catch(function(err) {
                                    res.status(400).send(err);
                                });
                            }else{
                                var result = {
                                    status:false,
                                    message:"Not user found."
                                };
                                deferred.resolve(result);
                            }
                        }
                    });
                }
            }
        });
    });
    return deferred.promise;
}

/**
 * user normal login
 */
function signin(data) {
    var deferred = Q.defer();
    pool.getConnection(function(err, connection) {
        if(err) { 
          console.log(err); 
          callback(true); 
          return; 
        }
        // check user is exist in database or not
        var query = connection.query('SELECT * FROM users WHERE email = ? AND login_type= ?',[data.email,data.login_type], function (err, results, fields) {
            connection.release();
            if (err) {
                deferred.reject(err);
            }else{
                if(results!=undefined && results!='' && results.length >0){
                    if(results.is_confirm!==1){    
                        if(data.password!==undefined){
                            // checking user password 
                            bcrypt.compare(data.password, results[0].password, function(err, res) {
                                if(res){
                                    var today = new Date();
                                var tokenData={
                                    user_id:results[0].id,
                                    device_token:data.device_token,
                                    device_type:parseInt(data.device_type),
                                    created_at:today,
                                    updated_at:today,

                                }
                                    tokenService.addToken(tokenData)
                                    .then(function(user) {
                                        if (user) {
                                            var tokenData = {
                                                email: results[0].email,
                                                id: results[0].id
                                            };
                                            var result = {
                                                status:true,
                                                token: Jwt.sign(tokenData, privateKey),
                                                user_name:results[0].user_name
                                            };
                                        } else {
                                            res.sendStatus(404);
                                        }
                                        deferred.resolve(result);
                                    })
                                    .catch(function(err) {
                                        res.status(400).send(err);
                                    });
                                }else{
                                    var result = {
                                        status:false,
                                        message:"Email and password does not match"
                                    };
                                    deferred.resolve(result);
                                }
                                
                            });
                        }
                        else{
                            var result = {
                                status:false,
                                message:"Password does not exits"
                            };
                            deferred.resolve(result);
                        }
                    }
                    else{
                        var result = {
                            status:false,
                            message:"Your Account is not verified."
                        };
                        deferred.resolve(result);
                    }
                }
                else{
                    var result = {
                        status:false,
                        message:"Email does not exits"
                    };
                    deferred.resolve(result);
                }
            }
        });
    });
    return deferred.promise;
}
/**
 * user social register
 */
function socailSignup(data){
    var deferred = Q.defer();
    pool.getConnection(function(err, connection) {
        if(err) { 
          console.log(err); 
          callback(true); 
          return; 
        }
        // check user is exist in database or not
        var query = connection.query('SELECT * FROM users WHERE email = ?',[data.email], function (err, results, fields) {
            if (err) {
                deferred.reject(err);
            }else{
                if(results.length >0){
                    connection.release();
                    var result = {
                        status:false,
                        message:"This user is already exists."
                    };
                    deferred.resolve(result);
                }
                else{
                    var today = new Date();
                    var tokenData={
                        user_id:results.insertId,
                        device_token:data.device_token,
                        device_type:parseInt(data.device_type),
                        created_at:today,
                        updated_at:today,
                    }
                    // add user data into database
                    connection.query('INSERT INTO users SET ?',data, function (error, results, fields) {
                        connection.release();
                        if (error) {
                            deferred.reject(err);
                        }else{
                            if(results){
                                tokenService.addToken(tokenData)
                                .then(function(user) {
                                    if (user) {
                                        var tokenData = {
                                            email: data.email,
                                            id: results.insertId
                                        };
                                        var result = {
                                            status:true,
                                            token: Jwt.sign(tokenData, privateKey),
                                            user_name:data.user_name
                                        };
                                    } else {
                                        res.sendStatus(404);
                                    }
                                    deferred.resolve(result);
                                })
                                .catch(function(err) {
                                    res.status(400).send(err);
                                });
                            }else{
                                var result = {
                                    status:false,
                                    message:"Not user found."
                                };
                                deferred.resolve(result);   
                            }
                        }
                    });
                }
            }
        });
    });
    return deferred.promise;
}
/**
 * user check email is available
 */
function checkEmail(data){
    var deferred = Q.defer();
    pool.getConnection(function(err, connection) {
        if(err) { 
          console.log(err); 
          callback(true); 
          return; 
        }
        // check user is exist in database or not
        var query = connection.query('SELECT * FROM users WHERE email = ? ',[data.email], function (err, results, fields) {
            connection.release();
            if (err) {
                deferred.reject(err);
            }else{
                if(results!=undefined && results!='' && results.length >0){
                    var tokenData = {
                        email: data.email
                    };
                    var token = Jwt.sign(tokenData, Config.key.privateKey)
                    let reseturl = Config.server.clientUrl+'/changepassword/'+token;
                    let html = `
                        Hello <b>`+data.email+`</b><br>
                        Please Click below link to reset password.<br>
                        <a href='`+reseturl+`'>Reset Password</a>
                    `;
                    try{
                        //send email to user with reset token
                        sendmail(data.email,'Reset Password','Reset Password Link',html);
                        deferred.resolve({status:true,msg:'Reset Password link send to '+data.email+' mail id.'});
                    }
                    catch(ex){
                        deferred.resolve(ex);
                    }
                }
                else{
                    var result = {
                        status:false,
                        message:"Email does not exits"
                    };
                    deferred.resolve(result);
                }
            }
            
        });
    });
    return deferred.promise;
}
/**
 * user social login
 */
function socialSignin(data){
    var deferred = Q.defer();
    pool.getConnection(function(err, connection) {
        if(err) { 
          console.log(err); 
          callback(true); 
          return; 
        }
        // check user is exist in database or not
        var query = connection.query('SELECT * FROM users WHERE social_id = ? AND login_type= ?',[data.social_id,data.login_type], function (err, results, fields) {
            connection.release();
            if (err) {
                deferred.reject(err);
            }else{
                if(results.length >0){
                    if(results){
                        var today = new Date();
                        var tokenData={
                            user_id:results[0].id,
                            device_token:data.device_token,
                            device_type:parseInt(data.device_type),
                            created_at:today,
                            updated_at:today,

                        }
                            tokenData.user_id=results.insertId
                            tokenService.addToken(tokenData)
                            .then(function(user) {
                                if (user) {
                                    var tokenData = {
                                        email: results[0].email,
                                        id: results[0].id
                                    };
                                    var result = {
                                        status:true,
                                        token: Jwt.sign(tokenData, privateKey),
                                        user_name: results[0].user_name
                                    };
                                } else {
                                    res.sendStatus(404);
                                }
                                deferred.resolve(result);
                            })
                            .catch(function(err) {
                                res.status(400).send(err);
                            });
                    }else{
                        var result = {
                            status:false,
                            message:"User does not match"
                        };
                        deferred.resolve(result);
                    }
                   // deferred.resolve(result);
                }
                else{
                    var result = {
                        status:false,
                        message:"User does not exits"
                    };
                    deferred.resolve(result);
                }
            }
        });
    });
    return deferred.promise;
}
/**
 * change password
 */
function changepassword(data){
    var deferred = Q.defer();
    var decoded = Jwt.verify(data.token,Config.key.privateKey);
    pool.getConnection(function(err, connection) {
        if(err) { 
          console.log(err); 
          callback(true); 
          return; 
        }
        // check user is exist in database or not
        var query = connection.query('SELECT * FROM users WHERE email = ?',decoded.email, function (err, results, fields) {
            
            if (err) {
                deferred.reject(err);
            }else{
                if(results.length >0){
                    bcrypt.compare(data.oldpassword, results[0].password, function(err, res) {
                        if(res){
                            // update user detail
                            connection.query('UPDATE users SET password = ? WHERE email=?',[data.password,decoded.email], function (error, result, rows, fields) {
                                connection.release();
                                if (error) {
                                    deferred.reject(error);
                                }else{
                                    var result = {
                                        status:true,
                                        message:"password changed successfully."
                                    };
                                    deferred.resolve(result);
                                }
                            });
                        }else{
                            var result = {
                                status:false,
                                message:"you have enter wrong password"
                            };
                            deferred.resolve(result);
                        }
                    });
                }
                else{
                    connection.release();
                    var result = {
                        status:false,
                        message:"No user found."
                    };
                    deferred.resolve(result);
                }
            }
        });
    });
    return deferred.promise;
}
/**
 * reset password
 */
function resetpassword(data){
    var deferred = Q.defer();
    var decoded = Jwt.verify(data.token,Config.key.privateKey);
    pool.getConnection(function(err, connection) {
        if(err) { 
          console.log(err); 
          callback(true); 
          return; 
        }
        // check user is exist in database or not
        var query = connection.query('SELECT * FROM users WHERE email = ?',decoded.email, function (err, results, fields) {
            if (err) {
                deferred.reject(err);
            }else{
                if(results.length >0){
                    // update user password
                    connection.query('UPDATE users SET password = ? WHERE email=?',[data.password,decoded.email], function (error, result, rows, fields) {
                        connection.release();
                        if (error) {
                            deferred.reject(error);
                        }else{
                            var result = {
                                status:true,
                                message:"password changed successfully."
                            };
                            deferred.resolve(result);
                        }
                    });
                }
                else{
                    connection.release();
                    var result = {
                        status:false,
                        message:"No user found."
                    };
                    deferred.resolve(result);
                }
            }
        });
    });
    return deferred.promise;
}
/**
 * return user
 */
function getUserProfile(data){
    var deferred = Q.defer();
    pool.getConnection(function(err, connection) {
        if(err) { 
          console.log(err); 
          callback(true); 
          return; 
        }
        // check user is exist in database or not
        var query = connection.query('SELECT email,dob FROM users WHERE id = ?',[data.user_id], function (err, results, fields) {
            connection.release();
            if (err) {
                deferred.reject(err);
            }else{
                if(results.length >0){  
                    var result = {
                        status:true,
                        results: results[0]
                    };
                    deferred.resolve(result);
                }
                else{
                    var result = {
                        status:false,
                        message:"User does not exits"
                    };
                    deferred.resolve(result);
                }
            }
        });
    });
    return deferred.promise;
}
/**
 * update User
 */
function updateUser(data){
    var deferred = Q.defer();
    pool.getConnection(function(err, connection) {
        if(err) { 
          console.log(err); 
          callback(true); 
          return; 
        }
        // check user is exist in database or not
        var query = connection.query('SELECT * FROM users WHERE id = ?',data.user_id, function (err, results, fields) {
            
            if (err) {
                deferred.reject(err);
            }else{
                if(results.length >0){
                    // update user DOB
                    var query =  connection.query('UPDATE users SET  dob = ? WHERE id=?',[data.dob,data.user_id], function (error, result, rows, fields) {
                        connection.release();
                        if (error) {
                            deferred.reject(error);
                        }else{
                            var result = {
                                status:false,
                                message:"user profile update successfully."
                            };
                            deferred.resolve(result);
                        }
                    });
                }
                else{
                    connection.release();
                    var result = {
                        status:false,
                        message:"No user found."
                    };
                    deferred.resolve(result);
                }
            }
        });
    });
    return deferred.promise;
}

