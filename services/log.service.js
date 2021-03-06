var Logger = require('../models/logger.model');
const dateFormat = require('../helper/dateFormate.helper');

exports.responseData = async (req,res, requestTime = null, responseTime = null) => {
    try {
        var log = new Logger({
            url: req.url,
            orginalUrl: req.originalUrl,
            method: req.method,
            body: req.body,
            requestTime,
            responseTime,
            createdAt: await dateFormat.setCurrentTimestamp(),
            loggedInUser: (req.user) ? req.user._id : null,
            response: res
        });
        await log.save();
    }
    catch (err) {
        console.log(err);
        throw new Error('Something wrong in fetching response');
    }
 } 