const constants = require('../config/constants');
const commonFunction = require('./commonFunction.helper');

/**
 * Message response files.
 * @function
 * @param {String} message - Message combined with object and it's key
 * @param {String} lang - Preferred Language
 * @returns {String} response - Return message as per preferred language
 * 1. It will check preferred language and will open that file.
 * 2. It will return message as per set value.
 */
exports.responseIn = function(message, lang='en'){
    appLanguageList = constants.APP_LANGUAGE;
    messages = ((appLanguageList.indexOf(lang) != -1)) ? require(`../lang/${lang}/message`) : require('../lang/en/message');

    var obj = message.split(".");
    keyName = obj[0];
    subKey = obj[1];

    return messages[keyName][subKey];
}

exports.dynamicResponseIn = async function(message, sourceData, lang='en'){
    appLanguageList = constants.APP_LANGUAGE;
    messages = ((appLanguageList.indexOf(lang) != -1)) ? require(`../lang/${lang}/message`) : require('../lang/en/message');

    var obj = message.split(".");
    keyName = obj[0];
    subKey = obj[1];

    let originalMessage = messages[keyName][subKey];

    let responseString = await commonFunction.replaceStringWithObjectData(originalMessage, sourceData)

    return responseString;
}

exports.sendCustomException = (message, metaData, customErrorCode) => {
    const error = new Error(message);
    error.metaData = metaData;
    error.customErrorCode = customErrorCode;
    return error;
};