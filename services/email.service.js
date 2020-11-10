const sgMail = require('@sendgrid/mail');

const constants=require('../config/constants');
const keys = require('../keys/development.keys')
const emailTemplate = require('../models/emailTemplate.model');
const commonFunction = require('../helper/commonFunction.helper');
const GlobalGeneralSettings = require('../models/globalGeneralSettings.model');

sgMail.setApiKey(keys.SEND_GRID_API_KEY);

//Set up email service
const sendMail = async (req, data) => {
    try {
        if(!data){
          return false;
        }

        var templateSlug = data.templateSlug;

        let template = await emailTemplate.findOne({'slug': templateSlug});

        if(!template){
          return false;
        }
        var replaceObjData = data.data;
        var templateData = template.body;

        let globalGeneralSettings = await GlobalGeneralSettings.findOne();
        let welcomeEmail = globalGeneralSettings.welcomeEmail;
        var body = await commonFunction.replaceStringWithObjectData(templateData, replaceObjData);
        
        var mailContent = body;
    
        const msg = {
          to: data.to,
          from: welcomeEmail,
          subject: template.subject,
          html:mailContent
        }

        await sgMail.send(msg);
        return true;
    }
    catch (err) {
        console.log(err);
        
        throw new Error('Email could not be send.');
    }
}

module.exports = sendMail;