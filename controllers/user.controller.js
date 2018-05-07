var userService = require('services/user.service');
var bcrypt = require('bcrypt');
const Config = require('../config/config');
const Jwt = require('jsonwebtoken');
var tokenService = require('services/devicetoken.service');

/**
 * @param user register
 */
function signupUser(req, res) {
    var errors = [];
    var fielderrors = [];
     // validation rules for upload images    
    var errors = checkvalidation([{
                    'key' : 'login_type',
                    'value':req.body.login_type,
                    'validate':['notempty']
                },{
                    'key' : 'device_token',
                    'value':req.body.device_token,
                    'validate':['notempty']
                },{
                    'key' : 'device_type',
                    'value':req.body.device_type,
                    'validate':['notempty']
                }]);
                
    if(errors.length<=0){
        var today = new Date();
        /**
         * normal signup
         */
        if(req.body.login_type==0){
             // validation rules for upload images    
            var fielderrors = checkvalidation([{
                'key' : 'email',
                'value':req.body.email,
                'validate':['notempty','email']
            },{
                'key' : 'password',
                'value':req.body.password,
                'validate':['notempty']
            },{
                'key' : 'user_name',
                'value':req.body.user_name,
                'validate':['notempty']
            },{
                'key' : 'dob',
                'value':req.body.dob,
                'validate':['notempty']
            }]);
            // get needed data from request
            var data = {
                email: req.body.email,
                user_name:req.body.user_name,
                password: req.body.password,
                dob: req.body.dob,
                login_type: req.body.login_type,
                is_confirm : 1,
                created_at:today,
                updated_at:today,
                device_type:req.body.device_type,
                device_token:req.body.device_token,
            };
        }

        /**
         * facebook signup
         */
        else if(req.body.login_type==1){
             // validation rules for upload images    
            var fielderrors = checkvalidation([{
                'key' : 'email',
                'value':req.body.email,
                'validate':['notempty','email']
            },{
                'key' : 'dob',
                'value':req.body.dob,
                'validate':['notempty']
            },{
                'key' : 'social_id',
                'value':req.body.social_id,
                'validate':['notempty']
            }]);
            // get needed data from request
            var data = {
                email: req.body.email,
                user_name:req.body.user_name,
                dob: req.body.dob,
                login_type: req.body.login_type,
                social_id: req.body.social_id,
                is_confirm : 1,
                created_at:today,
                updated_at:today,
                device_type:req.body.device_type,
                device_token:req.body.device_token,
            };
        }
        /**
         * gmail signup
         */
        else if(req.body.login_type==2){
             // validation rules for upload images    
            var fielderrors = checkvalidation([{
                'key' : 'email',
                'value':req.body.email,
                'validate':['notempty','email']
            },{
                'key' : 'dob',
                'value':req.body.dob,
                'validate':['notempty']
            },{
                'key' : 'social_id',
                'value':req.body.social_id,
                'validate':['notempty']
            }]);
            //// get needed data from request
            var data = {
                email: req.body.email,
                user_name:req.body.user_name,
                dob: req.body.dob,
                login_type: req.body.login_type,
                social_id: req.body.social_id,
                is_confirm : 1,
                created_at:today,
                updated_at:today,
                device_type:req.body.device_type,
                device_token:req.body.device_token,
            };
        }
        /**
         * linkedin signup
         */
        else{
             // validation rules for upload images    
            var fielderrors = checkvalidation([{
                'key' : 'email',
                'value':req.body.email,
                'validate':['notempty','email']
            },{
                'key' : 'dob',
                'value':req.body.dob,
                'validate':['notempty']
            },{
                'key' : 'social_id',
                'value':req.body.social_id,
                'validate':['notempty']
            }]);

            // get needed data from request
            var data = {
                email: req.body.email,
                user_name:req.body.user_name,
                dob: req.body.dob,
                login_type: req.body.login_type,
                social_id: req.body.social_id,
                is_confirm : 1,
                created_at:today,
                updated_at:today,
                device_type:req.body.device_type,
                device_token:req.body.device_token,
            };
        }

        if(fielderrors.length<=0){
            if(req.body.login_type==0){
                bcrypt.hash(data.password, Config.bcryptkey.saltRounds, function(err, hash) {
                    data.password = hash;
                     // send data to services
                    userService.signup(data)
                        .then(function(user) {
                            if (user) {
                                //send confrim email to user
                                let confirmurl = Config.server.host+':'+Config.server.port+'/users/activateuser?id='+user.token;
                                let html = `
                                    Hello <b>`+data.email+`</b><br>
                                    Please Click below link to activate your account.<br>
                                    <a href='`+confirmurl+`'>Activation Link</a>
                                `;
                                sendmail(data.email,'Register Confirmation Link','Register Confirmation Link',html);
                                res.send(user)
                            } else {
                                res.sendStatus(404);
                            }
                        })
                        .catch(function(err) {
                            res.status(400).send(err);
                        });
                });
            }
            else{
                userService.socailSignup(data)
                .then(function(user) {
                    if (user) {
                        res.send(user)
                    } else {
                        res.sendStatus(404);
                    }
                })
                .catch(function(err) {
                    res.status(400).send(err);
                });
            }
        }
        else{
            res.send(fielderrors);
        }
    }
    else{
        res.send(errors);
    }
}
/**
 * 
 * @param user Login
 */
function signinUser(req, res) {
    var errors = [];
    var fielderrors = [];
     // validation rules for upload images    
    var errors = checkvalidation([{
                    'key' : 'login_type',
                    'value':req.body.login_type,
                    'validate':['notempty']
                },{
                    'key' : 'device_token',
                    'value':req.body.device_token,
                    'validate':['notempty']
                },{
                    'key' : 'device_type',
                    'value':req.body.device_type,
                    'validate':['notempty']
                }]);
    if(errors.length<=0){
        if(req.body.login_type==0){
             // validation rules for upload images    
            var fielderrors = checkvalidation([{
                'key' : 'email',
                'value':req.body.email,
                'validate':['notempty','email']
            },{
                'key' : 'password',
                'value':req.body.password,
                'validate':['notempty']
            }]);
            // get needed data from request
            var data = {
                email: req.body.email,
                password: req.body.password,
                login_type: req.body.login_type,
                device_token:req.body.device_token,
                device_type:req.body.device_type,
            };
            if(fielderrors.length<=0){
                // send data to services
                userService.signin(data)
                    .then(function(user) {
                        if (user) {
                            res.send(user)
                        } else {
                            res.sendStatus(404);
                        }
                    })
                    .catch(function(err) {
                        res.status(400).send(err);
                    });
            }
            else{
                res.send(fielderrors);
            }
        }
        else{
             // validation rules for upload images    
            var fielderrors = checkvalidation([{
                'key' : 'social_id',
                'value':req.body.social_id,
                'validate':['notempty']
            }]);
            // get needed data from request
            var data = {
                social_id: req.body.social_id,
                login_type: req.body.login_type
            };
            if(fielderrors.length<=0){
                // send data to services
                userService.socialSignin(data)
                    .then(function(user) {
                        if (user) {
                            res.send(user)
                        } else {
                            res.sendStatus(404);
                        }
                    })
                    .catch(function(err) {
                        res.status(400).send(err);
                    });
            }
            else{
                res.send(fielderrors);
            }
        }
    }
    else{
        res.send(errors);
    }
}

/**
 * @param logout user
 */
function logoutUser(req, res){
    // get needed data from request
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    invalidToken(token);
    // delete token from array
    tokenService.deleteToken(req.body.device_token);
    res.send({status:true});
}

/**
 * @param change password
 */
function changepassword(req, res) {
    var errors = [];
     // validation rules for upload images    
    var errors = checkvalidation([{
                    'key' : 'oldpassword',
                    'value':req.body.oldpassword,
                    'validate':['notempty']
                },{
                    'key' : 'password',
                    'value':req.body.password,
                    'validate':['notempty']
                }]);
    
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if(errors.length<=0){
        // get needed data from request
        var data = {
            oldpassword: req.body.oldpassword,
            password: req.body.password,
            token:token
        };
        bcrypt.hash(data.password, Config.bcryptkey.saltRounds, function(err, hash) {
            data.password = hash;
             // send data to services
            userService.changepassword(data)
                .then(function(user) {
                    if (user) {
                        res.send(user)
                    } else {
                        res.sendStatus(404);
                    }
                })
                .catch(function(err) {
                    res.status(400).send(err);
                });
        });
        }
    else{
        res.send(errors)
    }
}

/**
 * reset password 
 */
function resetpassword(req, res) {
    var errors = [];
     // validation rules for upload images    
    var errors = checkvalidation([{
                    'key' : 'compare_password',
                    'value':req.body.compare_password,
                    'validate':['notempty']
                },{
                    'key' : 'password',
                    'value':req.body.password,
                    'validate':['notempty']
                },{
                    'key' : 'id',
                    'value':req.body.id,
                    'validate':['notempty']
                }]);
    
    if(errors.length<=0){
        // get needed data from request
        var data = {
            compare_password: req.body.compare_password,
            password: req.body.password,
            token:req.body.id
        };
        bcrypt.hash(data.password, Config.bcryptkey.saltRounds, function(err, hash) {
            data.password = hash;
             // send data to services
            userService.resetpassword(data)
                .then(function(user) {
                    if (user) {
                        res.send(user)
                    } else {
                        res.sendStatus(404);
                    }
                })
                .catch(function(err) {
                    res.status(400).send(err);
                });
        });
    }
    else{
        res.send(errors)
    }
}

/**
 * @param forget password
 */
function forgetpassword(req,res){
    var errors = [];
     // validation rules for upload images    
    var errors = checkvalidation([{
                    'key' : 'email',
                    'value':req.body.email,
                    'validate':['notempty','email']
                }]);
                
    if(errors.length<=0){
        var data = {
            email: req.body.email
        };
         // send data to services
        userService.checkEmail(data)
        .then(function(user) {
            if (user) {
                res.send(user)
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function(err) {
            res.status(400).send(err);
        });
    }
    else{
        res.send(errors);
    }
}

/**
 * return user profile
 */
function getUserProfile(req,res){
    // check token empty or not // decode token to get email and user id
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if(token==undefined || token==null || token==''){
        res.send({
            status:false,
            message:"User Not Found."});
    }
    else{
        // decode token to get email and user id
        var decoded = Jwt.verify(token,Config.key.privateKey);
        if(decoded.id!==undefined && decoded.id!==null && decoded.id!==''){
            var data = {
                user_id:decoded.id
            };
             // send data to services
            userService.getUserProfile(data)
                .then(function(user) {
                    if (user) {
                        res.send(user)
                    } else {
                        res.sendStatus(404);
                    }
                })
                .catch(function(err) {
                    res.status(400).send(err);
                });
        }
        else{
            res.send({
                status:false,
                message:"Token is not valid."});
        }
    }
}
/**
 * 
 * @param user update
 */
function updateUserProfile(req,res){
    var errors = [];
     // validation rules for upload images    
    var errors = checkvalidation([{
            'key' : 'username',
            'value':req.body.username,
            'validate':['username']
        },{
            'key' : 'gender',
            'value':req.body.gender,
            'validate':['gender']
        },{
            'key' : 'dob',
            'value':req.body.dob,
            'validate':['dob']
        },{
            'key' : 'mobileno',
            'value':req.body.mobileno,
            'validate':['mobileno']
    }]);
    if(errors.length<=0){
        // check token empty or not 
        var token = req.body.token || req.query.token || req.headers['x-access-token'];
        if(token==undefined || token==null || token==''){
            res.send({
                status:false,
                message:"User Not Found."});
        }
        else{
            // decode token to get email and user id
            var decoded = Jwt.verify(token,Config.key.privateKey);
            if(decoded.id!==undefined && decoded.id!==null && decoded.id!==''){
                // get needed data from request
                var data = {
                    username: req.body.username,
                    gender: req.body.gender,
                    dob: req.body.dob,
                    mobileno: req.body.mobileno,
                    user_id:decoded.id
                };
                 // send data to services
                userService.updateUser(data)
                .then(function(user) {
                    if (user) {
                        res.send(user)
                    } else {
                        res.sendStatus(404);
                    }
                })
                .catch(function(err) {
                    res.status(400).send(err);
                });    
            }
            else{
                res.send({
                    status:false,
                    message:"Token is not valid."});
            }
        }
    }
    else{
        res.send(errors);
    }
}

//Export API
module.exports = function(params)
{
    var app = params.app;
    app.post('/users/login', signinUser);
    app.post('/users/signup', signupUser);
    app.post('/users/logout', logoutUser);
    app.post('/users/changepassword', changepassword);
    app.post('/users/resetpassword', resetpassword);
    app.post('/users/forgetpassword', forgetpassword);
    app.get('/users/getuserprofile', getUserProfile);
    app.post('/users/updateuserprofile', updateUserProfile);
}