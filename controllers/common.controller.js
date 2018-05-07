const nodemailer = require('nodemailer');
var ses = require('nodemailer-ses-transport');
// common function for whole project

module.exports = function(params)
{
    var app = params.app;
    var blacklistToken = [];

    // create reusable transporter object using the default SMTP transport
    var transporter = nodemailer.createTransport({
        host: '',
        port: 465,
        secureConnection: false, // true for 465, false for other ports
        auth: {
            user: '', // generated ethereal user
            pass: ''  // generated ethereal password
        },
        tls: {
            ciphers:'SSLv3'
        }
    });
    /**
     * common send email functionality
     */
    sendmail = function(to,subject,text,html){ 
        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        // nodemailer.createTestAccount((err, account) => {
            
            // setup email data with unicode symbols
            let mailOptions = {
                from: '', // sender address
                to:  to, // list of receivers
                subject: subject, // Subject line
                text: text, // plain text body
                html: html 
            };
            // send mail with defined transport object
            return transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: %s', info.messageId);
                // Preview only available when sending through an Ethereal account
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@blurdybloop.com>
                // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
            });
        // });
    };

    /**
     *  make token invalid on user logout
     */
    invalidToken = function(token){
        console.log(blacklistToken);
        return (blacklistToken.indexOf(token)>=0)?true:blacklistToken.push(token);
    };

    /**
     *  check token is valid or not
     */
    checkToken = function(token){
        console.log(blacklistToken);
        return (blacklistToken.indexOf(token)>=0)?false:true;
    };
    
    /**
     * check common validation function for data coming from APIs for empty and email only.
     */
    checkvalidation = function(fields){
        var errors = [];
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        for (var k in fields) {
            for (var valid in fields[k]['validate']) {
                if(fields[k]['validate'][valid]=='notempty'){
                    if(fields[k]['value']=='' || fields[k]['value']==undefined || fields[k]['value']==null){
                        errors.push(fields[k]['key']+' Should not be empty.');
                    }
                }
                if(fields[k]['validate'][valid]=='email'){
                    if(!re.test(fields[k]['value'])){
                        errors.push('Email is not valid.');
                    }
                }
            }
        }
        return errors;
    }
}