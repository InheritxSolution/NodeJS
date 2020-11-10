const EmailFormat = require('../../models/emailTemplate.model');
const dateFormat = require('../../helper/dateFormate.helper');
const constants = require('../../config/constants');
const logService = require('../../services/log.service');
const Lang = require('../../helper/response.helper');


//create email template
exports.createEmailTemplate = async (req, res) => {
    try{
        let reqdata = req.body;

        var emailTemplateTitle = (reqdata.title).trim()
        var regex = new RegExp('^' + emailTemplateTitle.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i');
        var isTemplateExist = await EmailFormat.findOne({title: {$regex : regex}});
        
        if(isTemplateExist){
            return res.status(500).send({
                status:constants.STATUS_CODE.FAIL,
                message: Lang.responseIn("EMAIL.TITLE_ALREADY_EXISTS", req.headers.lang),
                error: true,
                data: {},
            });
        }
    
        emailFormat = new EmailFormat();
        emailFormat.id = reqdata.id;
        emailFormat.title = reqdata.title;
        emailFormat.keys = reqdata.keys;
        emailFormat.subject = reqdata.subject;
        emailFormat.body = reqdata.body;
        emailFormat.status = reqdata.status;
        emailFormat.slug = reqdata.slug;
        emailFormat.createdAt = dateFormat.setCurrentTimestamp();
        emailFormat.updatedAt = dateFormat.setCurrentTimestamp();

        let emailFormatData = await emailFormat.save();

        res.status(201).send({
            status:constants.STATUS_CODE.SUCCESS,
            message: Lang.responseIn("EMAIL.EMAIL_FORMAT_CREATED_SUCCESS", req.headers.lang),
            error: false,
            data : emailFormatData
        });
    }catch(error){
        console.log(error)
        
        res.status(400).send({
            status:constants.STATUS_CODE.FAIL,
            message: Lang.responseIn("GENERAL.GENERAL_CATCH_MESSAGE", req.headers.lang),
            error: true,
            data:{}
        });

        logService.responseData(req, error);
    }
}

//get all Email Templates
exports.getAllEmailTemplate = async (req, res) => {

    try{
        EmailTemplateData = await EmailFormat.find()
        
        if(EmailTemplateData.length <=0){
            return res.status(404).send({
                status:constants.STATUS_CODE.FAIL,
                message: Lang.responseIn("EMAIL.NO_EMAIL_FORMAT_EXISTS", req.headers.lang),
                error: true,
                data: {},
            });
        }

        res.status(200).send({
            status:constants.STATUS_CODE.SUCCESS,
            message: Lang.responseIn("EMAIL.EMAIL_TEMPLATE_RETRIEVE", req.headers.lang),
            error: false,
            data : EmailTemplateData
        });
    }catch(error){
        console.log(error)
        
        res.status(400).send({
            status:constants.STATUS_CODE.FAIL,
            message: Lang.responseIn("GENERAL.GENERAL_CATCH_MESSAGE", req.headers.lang),
            error: true,
            data:{}
        });

        logService.responseData(req, error);
    }
}

//update email template
exports.updateEmailTemplate = async (req, res) => {
    try{
        let reqdata = req.body;

        emailFormatData = await EmailFormat.findById(req.params.id)

        if(!emailFormatData){
            return res.status(500).send({
                status:constants.STATUS_CODE.FAIL,
                message: Lang.responseIn("EMAIL.NO_EMAIL_FORMAT_EXISTS", req.headers.lang),
                error: true,
                data: {},
            });
        }

        var emailTemplateTitle = (reqdata.title).trim()
        var regex = new RegExp('^' + emailTemplateTitle.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i');
        var isTemplateTitle = await EmailFormat.findOne({title: {$regex : regex}, _id: { 
            $ne: req.params.id
        },});
        
        if(isTemplateTitle){
            return res.status(500).send({
                status:constants.STATUS_CODE.FAIL,
                message: Lang.responseIn("EMAIL.TITLE_ALREADY_EXISTS", req.headers.lang),
                error: true,
                data: {},
            });
        }

        emailFormatData.title = reqdata.title;
        emailFormatData.keys = reqdata.keys;
        emailFormatData.subject = reqdata.subject;
        emailFormatData.body = reqdata.body;
        emailFormatData.status = reqdata.status;
        emailFormatData.createdAt = dateFormat.setCurrentTimestamp();
        emailFormatData.updatedAt = dateFormat.setCurrentTimestamp();

        let updatedEmailFormatData = await emailFormatData.save();

        res.status(200).send({
            status:constants.STATUS_CODE.SUCCESS,
            message: Lang.responseIn("EMAIL.EMAIL_FORMAT_UPDATED_SUCCESS", req.headers.lang),
            error: false,
            data : updatedEmailFormatData
        });
    }catch(error){
        console.log(error)
        
        res.status(400).send({
            status:constants.STATUS_CODE.FAIL,
            message: Lang.responseIn("GENERAL.GENERAL_CATCH_MESSAGE", req.headers.lang),
            error: true,
            data:{}
        });

        logService.responseData(req, error);
    }
}