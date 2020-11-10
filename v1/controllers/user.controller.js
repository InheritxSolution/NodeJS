const User = require('../../models/user.model');
const GlobalGeneralSettings = require('../../models/globalGeneralSettings.model');

const PromoCode = require('../../models/promoCode.model');
const bcrypt = require('bcryptjs');
const dateFormat = require('../../helper/dateFormate.helper');
const constants = require('../../config/constants');
const commonFunction = require('../../helper/commonFunction.helper');
const logService = require('../../services/log.service');
const sendEmail = require('../../services/email.service');

const Lang = require('../../helper/response.helper');
const MailChecker = require('../../services/emailVerification.service');

/**
 * User Normal Login
 * @param {String} email - if user wants to login with email
 * @param {Number} mobileNumber - if user wants to login with mobileNumber
 * @param {String} password - user's password
 * @param {String} deviceToken - user's mobile device token Optional
 * @param {String} deviceType - user's mobile device type Optional
 * @returns {Object} data - Returns user data and newly generated token.
 */
exports.userLogin = async (req, res) => {
    const { mobileNumber, email, password, deviceToken, deviceType } = req.body;
    try {
        if (email) {
            var email1 = email.toLowerCase().trim();
        }
        const user = await User.findByCredential(req, mobileNumber, email1, password);
        if(user.status == constants.STATUS.BLOCKED){
            return res.status(500).send({
                status:constants.STATUS_CODE.FAIL,
                message: Lang.responseIn("USER.USER_ACTIVATION_ERROR", req.headers.lang),
                error: true,
                data: {},
            });
        }

        if (user.userType !== constants.USER_TYPE.USER) {
            return res.status(400).send({
                status: constants.STATUS_CODE.FAIL,
                message: Lang.responseIn("GENERAL.UNAUTHRIZED_ACCESS", req.headers.lang),
                error: true,
                data: {}
            });
        }

        const token = await user.generateToken();
        if(deviceToken && deviceType){
            user.deviceTokens = user.deviceTokens.concat({ deviceToken, deviceType, token });
        }
        user.updatedAt = await dateFormat.setCurrentTimestamp();
        let data = await user.save();

        res.status(200).send({
            status: constants.STATUS_CODE.SUCCESS,
            message: Lang.responseIn("USER.LOGIN_SUCCESS", req.headers.lang),
            error: false,
            data: data, token
        });
    } catch (error) {
        if (error.message) {
            res.status(401).send({
                status: constants.STATUS_CODE.FAIL,
                message: error.message,
                error: true,
                data: {},
            });
            logService.responseData(req, error);
        } else {
            res.status(401).send({
                status: constants.STATUS_CODE.FAIL,
                message: error.errors[0].message,
                error: true,
                data: {},
            });
        }

        logService.responseData(req, error);
    }
}

/**
 * Register user, sub admin or accountant
 * @param {String} firstName - Required
 * @param {String} lastName - Required
 * @param {String} userName - Required
 * @param {String} email - Required
 * @param {String} password - Required if it's local sign up
 * @param {String} dob - Required
 * @param {String} userType - Required
 * @param {String} registerType - Required
 * @param {String} state - Required
 * @param {String} lat - Required
 * @param {String} long - Required
 * @param {String} deviceToken - user's mobile device token Optional
 * @param {String} deviceType - user's mobile device type Optional
 * @returns {Object} data - Returns created user data and newly generated token.
 */
exports.register = async (req, res) => {
    let session = await mongoose.startSession({
        readPreference: { mode: 'primary' }
      });
      session.startTransaction();
    try {
        let reqdata = req.body;
        let email = (reqdata.email).toLowerCase();

        if(reqdata.email){
            if(!MailChecker.isValid(email)){
                return res.status(400).send({
                      status: constants.STATUS_CODE.FAIL,
                      message: Lang.responseIn("USER.IS_EMAIL", req.headers.lang),
                      error: true,
                      data: {}
                  })
              }
        }

        let userType = reqdata.userType;
        if(userType != constants.USER_TYPE.USER){
            if((!req.user) || req.user.userType != constants.USER_TYPE.ADMIN){
                return res.status(400).send({
                    status: constants.STATUS_CODE.FAIL,
                    message: Lang.responseIn("ADMIN.SUB_ADMIN_OR_ACCOUNTANT_CREATE_RESTRICTION", req.headers.lang),
                    error: true,
                    data: {}
                })
            }
        }

        let isUserExist = await User.findOne({ email, deletedAt: null });
        if(isUserExist){
            return res.status(500).send({
                status: constants.STATUS_CODE.FAIL,
                message: Lang.responseIn("USER.EMAIL_ALREADY_EXISTS", req.headers.lang),
                error: true,
                data: {},
            });
        }

        if(reqdata.mobileNumber){
            let isMobileExist = await User.findOne({ mobileNumber: reqdata.mobileNumber, deletedAt: null });
            if (isMobileExist) {        
                return res.status(500).send({
                    status: constants.STATUS_CODE.FAIL,
                    message: Lang.responseIn("USER.MOBILE_ALREADY_EXISTS", req.headers.lang),
                    error: true,
                    data: {},
                });
            }
        }
        
        let newReferralCode = await commonFunction.generateRandomReferralCode();

        let user = new User();
        user.firstName = reqdata.firstName;
        user.lastName = reqdata.lastName;
        user.userName = reqdata.userName;
        if(reqdata.gender){
            user.gender = reqdata.gender;
        }
        user.dob = reqdata.dob;
        user.userType = reqdata.userType;
        user.registerType = reqdata.registerType;
        if (reqdata.countryCode) {
            user.countryCode = reqdata.countryCode;
        }
        user.email = reqdata.email;
        if (reqdata.googleSocialId) {
            user.googleSocialId = reqdata.googleSocialId;
            user.registerType = constants.REGISTER_TYPE.SOCIAL;
        }
        user.lat = reqdata.lat;
        user.long = reqdata.long;
        user.referralCode = newReferralCode;
        user._referBy = referredBy;
        user.referredByName = referredByName;
        user.otp = await commonFunction.generateRandomOtp();
        user.city = reqdata.city;
        user.state = state;
        user.country = country;
        user._rewardId = _defaultRewardId;

        if (reqdata.preferredLanguage) {
            user.preferredLanguage = reqdata.preferredLanguage;
        }

        user.createdAt = dateFormat.setCurrentTimestamp();
        user.updatedAt = dateFormat.setCurrentTimestamp();
        user.syncAt = dateFormat.setCurrentTimestamp();
        
        let userdata = await user.save({session});

        let sendMail = {
            'to': user.email,
            'templateSlug': constants.EMAIL_TEMPLATE.WELCOME_MAIL,
            'data': {
                userName: reqdata.userName,
                otp: userdata.otp
            }
        }

        let isSendEmail = await sendEmail(req, sendMail);
        if (isSendEmail) {
            console.log('email has been sent');
        } else {
            console.log('email has not been sent');
        }
        
        const token = await userdata.generateToken();
        if(reqdata.deviceToken && reqdata.deviceType){
            userdata.deviceTokens = userdata.deviceTokens.concat({ deviceToken: reqdata.deviceToken, deviceType: reqdata.deviceType, token });
            await userdata.save();
        }
        await session.commitTransaction();
        await session.endSession();

        res.status(201).send({
            status: constants.STATUS_CODE.SUCCESS,
            message: Lang.responseIn("USER.NEW_USER_CREATED", req.headers.lang),
            error: false,
            data: userdata, token
        });

        logService.responseData(req, userdata);

    } catch (error) {
        console.log(error)
        await session.abortTransaction();
        await session.endSession();
        
        res.status(400).send({
            status: constants.STATUS_CODE.FAIL,
            message: Lang.responseIn("GENERAL.GENERAL_CATCH_MESSAGE", req.headers.lang),
            error: true,
            data: {}
        });

        logService.responseData(req, error);
    }
}

//logout user from single device
exports.logoutSingleDevice = async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token)
        req.user.deviceTokens = req.user.deviceTokens.filter((token) => token.token !== req.token)
        req.user.updatedAt = await dateFormat.setCurrentTimestamp();
        await req.user.save()

        res.status(200).send({
            status: constants.STATUS_CODE.SUCCESS,
            message: Lang.responseIn("USER.LOGOUT_SUCCESS", req.headers.lang),
            error: false,
            data: {},
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            status: constants.STATUS_CODE.FAIL,
            message: Lang.responseIn("USER.LOGOUT_FAILED", req.headers.lang),
            error: true,
            data: {},
        })
        logService.responseData(req, error);
    }
}

//logout user from all devices
exports.logoutAllDevice = async (req, res) => {
    try {
        req.user.tokens = []
        req.user.deviceTokens = []
        req.user.updatedAt = await dateFormat.setCurrentTimestamp();
        await req.user.save()

        res.status(200).send({
            status: constants.STATUS_CODE.SUCCESS,
            message: Lang.responseIn("USER.LOGOUT_SUCCESS", req.headers.lang),
            error: false,
            data: {},
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            status: constants.STATUS_CODE.FAIL,
            message: Lang.responseIn("USER.LOGOUT_FAILED", req.headers.lang),
            error: true,
            data: {},
        })
        logService.responseData(req, error);
    }
}