
'use strict';


/***********
 modules
********* */
const Alexa = require("alexa-sdk");
const config = require("config.json")("./config/config.json");


const builtInHandler = require('./handlers/builtIn');
const lightHandler = require('./handlers/light');
const sessionHandler = require('./handlers/session');



// Alexa Skill application
global.APP_NAME = config.alexa.appName;
const APP_ID = config.alexa.appId;


// TEMP Gateway IP URL
global.BASE_URL = config.sl.gw;


// entry
exports.handler = function(event, context, callback) {
  //console.log(event);

  const alexa = Alexa.handler(event, context);

  alexa.appId = APP_ID;

  alexa.registerHandlers(sessionHandler, builtInHandler, lightHandler);

  alexa.execute();
};// exports.handler
