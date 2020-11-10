global.express = require('express');

const app = express();

const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const bodyParser = require('body-parser');
var flash = require('connect-flash');
var cookie = require('cookie-session');
const favicon = require('serve-favicon');

mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const constants = require('./config/constants');
const globalSettings = require('./config/default');
const keys = require('./keys/keys');
const Lang = require('./helper/response.helper');

const User = require('./models/user.model');
const EmailFormat = require('./models/emailTemplate.model');
const Cms = require('./models/cms.model');
const RestrictLocationModel = require('./models/restrictLocation.model');
const WhiteListCountryModel = require('./models/whitelistCountry.model');

const versionUpgrade = require('./middleware/versionUpgrade.middleware');

let globalPoint = async function () {
  let user = await User.findOne({});
  if(!user){
    await User.insertMany(globalSettings.USER);
  }
  let emailTemplates = await EmailFormat.findOne({});
  if(!emailTemplates){
    await EmailFormat.insertMany(globalSettings.EMAIL_TEMPLATES);
  }
  let cmsTemplates = await Cms.findOne({});
  if(!cmsTemplates){
    await Cms.insertMany(globalSettings.CMS_TEMPLATES);
  }

  let restrictLocation = await RestrictLocationModel.findOne({});
  if(!restrictLocation){
    await RestrictLocationModel.insertMany(globalSettings.RESTRICT_LOCATIONS);
  }
  
  let whiteListCountry = await WhiteListCountryModel.findOne({});
  if(!whiteListCountry){
    await WhiteListCountryModel.insertMany(globalSettings.WHITELIST_COUNTRIES);
  }
}

globalPoint();

const port = process.env.PORT || keys.PORT || 2020; // setting port
const env = process.env.ENV || 'development'; //setting environment
const httpsAllow = process.env.HTTPS_ALLOW || keys.HTTPS_ALLOW; //setting https or http server
const db = require('./database/mongoose.js'); // for database connection

//Cron job start
require('./cronJob/demo.cronJob');

app.set('trust proxy', true);
app.use(cors()); // for allow all request
app.use(bodyParser.urlencoded({ extended: true })); // to support URL-encoded bodies and to remove deprecation warnings
app.use(bodyParser.json()); // to parse body in json
app.use(express.static(path.join(__dirname, 'public'))); // to set public path
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(favicon(path.join(__dirname, 'public/images/logo', 'favicon.ico')));

app.use(morgan('dev'));
app.use(flash());

app.use(
  cookie({
    // Cookie config, take a look at the docs...
    secret: 'I Love India...',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
  })
);

// version 1
app.use('/api/v1/user', require('./v1/routes/user.route'));
app.use('/api/v1/email', require('./v1/routes/emailTemplate.route'));

//catch 404 and forward to error handler
app.use(function(req, res, next) {
  // console.log(req.header.lang);
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

//setting for error message in environment
if (env == 'development') {
  app.use((err, req, res, next) => {
    console.log(err);
    res.status(err.status || 500).send({
      status:constants.STATUS_CODE.FAIL,
      message: err.message,
      error: true,
      e: err
    });
  });
} else {
  // production error handler
  // no stacktraces leaked to user
  app.use((err, req, res, next) => {
    console.log(err);
    res.status(err.status || 500).send({
      message: Lang.responseIn("GENERAL.GENERAL_CATCH_MESSAGE", req.headers.lang),
      error: true,
      e: null
    });
  });
}

if (httpsAllow) {
    
    //Global BASE_URL
    global.app_base_url = keys.BASE_URL;
    http.createServer(app).listen(port, () => {
      console.log(
        `Server started with https on ${env} envrionment on port ${port}`
      );
    });
} else {
    //Global BASE_URL
    global.app_base_url = keys.BASE_URL + ':' + keys.PORT;
    http.createServer(app).listen(port, () => {
      console.log(
        `Server started with http on ${env} envrionment on port ${port}`
      );
    });
}

exports = module.exports = app;