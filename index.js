
'use strict';


/***********
 modules
********* */
const Alexa = require("alexa-sdk");
const config = require("config.json")("./config/config.json");


const builtInHandler = require('./handlers/builtIn');
const errorHandler = require('./handlers/error');
const gatewayHandler = require('./handlers/gateway');
const groupHandler = require('./handlers/group');
const lightPropertyHandler = require('./handlers/light_property');
const lightHandler = require('./handlers/light');
const sessionHandler = require('./handlers/session');
const unitSpaceHandler = require('./handlers/unit_space');

const makeGatewayURL = require('./js/make_gateway_URL');


// Alexa Skill application
global.APP_NAME = config.alexa.appName;
const APP_ID = config.alexa.appId;

const tableName = config.aws.dynamoDB.table.name;

// TEMP Gateway IP URL
global.BASE_URL = makeGatewayURL(config.sl.gw.ip, config.sl.gw.port, config.sl.gw.version);

global.PROTOCOL = "MQTT";
//global.PROTOCOL = "REST";

// entry
exports.handler = function(event, context, callback) {
  //console.log(event);

  const alexa = Alexa.handler(event, context);

  alexa.appId = APP_ID;

  alexa.dynamoDBTableName = tableName;

  alexa.registerHandlers(builtInHandler, errorHandler, gatewayHandler, groupHandler, lightPropertyHandler, lightHandler, sessionHandler, unitSpaceHandler);

  alexa.execute();
};// exports.handler
