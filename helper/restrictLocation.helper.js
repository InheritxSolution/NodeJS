const _ = require('lodash');
const requestIp = require('request-ip');
const RestrictLocationModel = require('../models/restrictLocation.model');
const WhiteListCountryModel = require('../models/whitelistCountry.model');

const constants = require('../config/constants');
const requestHelper = require('../helper/requestHelper.helper');

let getLocationFromIPAddress = async(ipAddress) => {
    let responseData = null;
    let serviceProviderUrl = keys.IP_SERVICE_PROVIDER.IP_API.URL;  
    let fields = keys.IP_SERVICE_PROVIDER.IP_API.FIELDS;
    let apiKey = keys.IP_SERVICE_PROVIDER.IP_API.API_KEY;
    let queryParams = null;

    if(fields != undefined && fields){
        queryParams = '?fields='+fields
    }else{
        queryParams = '?fields=status,message,country,countryCode,region,regionName';
    }
    let url = serviceProviderUrl+ipAddress+queryParams;

    if(!apiKey){
        throw Error('API Keys is required');
    }
    url = url + '&key='+apiKey;    

    responseData = await requestHelper.callApi(url);
    return responseData;
}

let getIPAddressFromReq = async(req) => {
    let ipAddress = null;
    const clientIp = requestIp.getClientIp(req);
    let ipAddressData = clientIp;
    // let ipAddressData = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    if(ipAddressData){
        ipAddress = sanitizeIPAddress(ipAddressData);
    }
    return ipAddress
}

let sanitizeIPAddress = (ipAddress) => {
    return ipAddress = ipAddress.replace('::ffff:', '');

    // if (ipAddress.substr(0, 7) == "::ffff:") {
    //     ipAddress = ipAddress.substr(7)
    // }
    // return ipAddress = ipAddress.replace(/^.*:/, '');

}

let validateUserLocation = async(locationData) => {
    let isValidLocation = true;
    let invalidField = null;
    let countryName = (locationData.country) ? locationData.country : null;
    let regionName = (locationData.regionName) ? locationData.regionName : null;

    // console.log(countryName, regionName);

    if(countryName){
        let countryNameRegex = new RegExp('^'+countryName+'$', 'i');
        let whiteListTextRegex = new RegExp('^'+constants.COUNTRY_WHITELIST_TEXT+'$', 'i');

        let isAllowAllCountries = await WhiteListCountryModel.findOne({
            "countryAlias": whiteListTextRegex
        })

        if(!isAllowAllCountries){
            let isCountryWhiteListed = await WhiteListCountryModel.findOne({
                "countryAlias": { $regex: countryNameRegex}
            })

            if(!isCountryWhiteListed){
                isValidLocation = false;
                invalidField = constants.LOCATION_VALIDATION_FAIL.WHITELIST_COUNTRY
            }
        }

        let isCountryFound = await RestrictLocationModel.findOne({
            "countryAlias": { $regex: countryNameRegex}
        })
        
        if(isCountryFound){
            // console.log("country found");
            if(isCountryFound.isContryRestricted == constants.IS_FULL_COUNTRY_RESTRICTED.YES){
                isValidLocation = false;
                invalidField = constants.LOCATION_VALIDATION_FAIL.COUNTRY
                // console.log("country invalid");
            }else if(regionName){
                let regionNameRegex = new RegExp('^'+regionName+'$', 'i');

                let isRestrictStateFound = await RestrictLocationModel.findOne({
                    "_id": isCountryFound._id,
                    "state.stateAlias": { $regex: regionNameRegex}
                });

                if(isRestrictStateFound){
                    // console.log("state invalid");
                    isValidLocation = false;
                    invalidField = constants.LOCATION_VALIDATION_FAIL.STATE
                }
            }
        }
    }

    return {
        isValidLocation: isValidLocation,
        countryName: countryName,
        stateName: regionName,
        invalidField: invalidField
    }
}

module.exports = {
    getLocationFromIPAddress,
    getIPAddressFromReq,
    sanitizeIPAddress,
    validateUserLocation
}