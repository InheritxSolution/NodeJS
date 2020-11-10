const fs = require('fs');
const gm = require('gm').subClass({imageMagick: true});
const _ = require('lodash');
const { validationResult } = require('express-validator');

const constants = require('../config/constants');
const Lang = require('../helper/response.helper');
const keys = require('../keys/keys');

/**
 * Resize an image after uploading it.
 * @function
 * @param {String} imagePath - Give folder path where your image is stored 
 */
exports.resizeImage = function(imagePath){
    gm(imagePath)
        .resize(240,240)
        .gravity('Center')
        // .extent(width,height)
        .noProfile()
        .write(imagePath, function (err) {
            if (err) {
                console.log(err)
                throw new Error();
            }
        });
}

/**
 * Remove an image from folder.
 * @function
 * @param {String} imagePath - Give folder path where your image is stored 
 */
exports.removeFile = function(delPath){
    if (fs.existsSync(delPath)) {
        fs.unlinkSync(delPath);
    }
}

/**
 * Replace string with object keys and value.
 * @function
 * @param {String} str - string which you want to replace with specific words
 * @param {Object} object - object containing specific key which you want in order to replace your string 
 * @returns {String} response - Return replaced string
 */
exports.replaceStringWithObjectData = function(str, object){
	if(!_.isEmpty(object)){
		stringStartSymbol = (typeof(constants.ENCRYPT_STRING.START_SYMBOL)===undefined) ? '{!{' : constants.ENCRYPT_STRING.START_SYMBOL

		stringEndSymbol = (typeof(constants.ENCRYPT_STRING.END_SYMBOL)===undefined) ? '}!}' : constants.ENCRYPT_STRING.END_SYMBOL

		for (let data in object) {

			msg = stringStartSymbol+data+stringEndSymbol
			str = str.replace(new RegExp(msg, 'g'), object[data])  //for replace all occurance
            //str = str.replace(msg, object[data])
		}
		return str;
	}
	return "";
}

/**
 * Show validation error message.
 * @function
 * @returns {Object} response - Return an error object 
 */
exports.validatorFunc = (req, res, next) => {
    let errArray = {};
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).send({
          statusCode:constants.STATUS_CODE.VALIDATION,
        //   message: errors.array()[0].msg,
          message: Lang.validationResponseIn(errors.array()[0].msg, req.headers.lang),
          error: true,
          data:{}
        });

    }
    next();
};