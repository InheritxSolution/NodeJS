const dateFormat = require('../helper/dateFormate.helper');
const constants = require('../config/constants');

module.exports = {
    'EMAIL_TEMPLATES' : [
        {
            "title" : "Welcome Mail",
            "keys" : "email, userName",
            "subject" : "Welcome Mail",
            "body" : "<p>Hi {!!!{userName}!!!},</p>\n\n<p>Welcome to Application.</p>\n\n<p>Here is your OTP: {!!!{otp}!!!}</p>\n\n<p>&nbsp;</p>",
            "slug" : "WELCOME_MAIL",
            "status" : constants.STATUS.ACTIVE,
            "id" : 1,
            "createdAt" : dateFormat.setCurrentTimestamp(),
            "updatedAt" : dateFormat.setCurrentTimestamp(),
        }
    ],
    'CMS_TEMPLATES' : [
        {
            "title" : "Terms Of Service",
            "slug" : "terms_conditions",
            "lang" : "en",
            "content" : "",
            "createdAt" : dateFormat.setCurrentTimestamp(),
            "updatedAt" : dateFormat.setCurrentTimestamp(),
        },
    ],
    'USER' : [
        {
            "status" : 1,
            "firstName" : "Admin",
            "lastName" : "User",
            "gender" : "male",
            "dob" : "02/14/1991",
            "userType" : 1,
            "mobileNumber" : "1234567890",
            "email" : "admin@platform.com",
            "password" : "$2a$10$PG3d56RWEZEUM9w8R8TIG.d7jYfBNkjfN6EfnDCeN52Na82aNRc5u",
            "createdAt" : dateFormat.setCurrentTimestamp(),
            "updatedAt" : dateFormat.setCurrentTimestamp(),
        },
    ],
    'RESTRICT_LOCATIONS': [
        {
            "countryUIName" : "India",
            "countryCode": "IN",
            "countryBaseName" : "India",
            "countryAlias" : ["India"],
            "isContryRestricted" : 0,
            "state" : [
                {
                    "stateUIName": "Assam",
                    "stateBaseName": "Assam",
                    "stateAlias": ["Assam"],
                    "stateCode": "AS",
                    "createdAt" : dateFormat.setCurrentTimestamp()
                }
            ],
            "createdAt" : dateFormat.setCurrentTimestamp(),
            "updatedAt" : dateFormat.setCurrentTimestamp(),
            "deletedAt" : null
        }
    ],
    'WHITELIST_COUNTRIES': [
        {
            "countryUIName" : "India",
            "countryCode": "IN",
            "countryBaseName" : "India",
            "countryAlias" : ["India"],
            "createdAt" : dateFormat.setCurrentTimestamp(),
            "updatedAt" : dateFormat.setCurrentTimestamp(),
            "deletedAt" : null
        }
    ]
}