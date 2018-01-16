
'use strict';


/***********
 modules
********* */
const Alexa = require("alexa-sdk");
const async = require("async");
const colorConverter = require("color-convert");
const config = require("config.json")("./config/config.json");
const request = require("request");


// constant
const INCREASE_CODE = 1;
const DECREASE_CODE = -1;

const INCREASE_RATE = 1.1;
const DECREASE_RATE = 0.9;
const DEFAULT_RATE = 1;

// system light API parameters
const SL_API_POWER_ON = "on";
const SL_API_POWER_OFF = "off";

const DEFAULT_POWER_LEVEL = 1000;


const SL_API_SUCCESS_CODE = 200;
const SL_API_FAILURE_CODE = 400;


// TEMP Gateway IP URL
const BASE_URL = config.sl.gw;

// Alexa Skill application
const APP_NAME = config.alexa.appName;
const APP_ID = config.alexa.appId;


// entry
exports.handler = function(event, context, callback) {
  //console.log(event);

  const alexa = Alexa.handler(event, context);

  alexa.appId = APP_ID;

  alexa.registerHandlers(sessionHandlers, builtInHandlers, LightHandlers);

  alexa.execute();
};// exports.handler

const sessionHandlers ={
  'LaunchRequest': function () {
    console.log("LaunchRequest");

    const speechOutput = 'Hi, there, This is ' + APP_NAME + ' skill app!';
    const reprompt = 'Ask me.';

    this.response.speak(speechOutput).listen(reprompt);
    this.emit(':responseReady');
  },// LaunchRequest
  'SessionEndedRequest': function () {
    console.log('SessionEndedRequest');

    const speechOutput = 'See ya!'

    this.response.speak(speechOutput);
  }// SessionEndedRequest
}// sessionHandlers

const builtInHandlers = {
  'AMAZON.HelpIntent': function () {
    console.log("HelpIntent");

    const speechOutput = 'This is alexa custom skill for ' + APP_NAME;
    const reprompt = 'Say hello, to hear me speak.';

    this.response.speak(speechOutput).listen(reprompt);
    this.emit(':responseReady');
  },// AMAZON.HelpIntent
  'AMAZON.CancelIntent': function () {
    console.log("CancelIntent");

    this.response.speak('Goodbye!');
    this.emit(':responseReady');
  },// AMAZON.CancelIntent
  'AMAZON.StopIntent': function () {
    console.log("StopIntent");

    this.response.speak('See you later!');
    this.emit(':responseReady');
  }// AMAZON.StopIntent
}// builtInHandlers

const LightHandlers = {
    'Discover': function () {
      console.log("Discover");

      const speechOutput = 'Which device?';
      const reprompt = 'off';

      this.response.speak(speechOutput).listen(reprompt);
      this.emit(':responseReady');
    },// Discover
    'TurnOn': function () {
      console.log("TurnOn");

      if (this.event.request.dialogState === 'STARTED') {
        var updatedIntent = this.event.request.intent;
        console.log(updatedIntent.slots);

        this.emit(':delegate', updatedIntent);
      } else if (this.event.request.dialogState !== 'COMPLETED'){
        this.emit(':delegate');
      } else {
        var updatedIntent = this.event.request.intent;

        //console.log(updatedIntent.slots);

        const deviceId = updatedIntent.slots.deviceId.value;

        handlePower(deviceId, SL_API_POWER_ON, DEFAULT_POWER_LEVEL, (function(error, resultObject){
          const speechOutput = 'turn on the ' + deviceId + ' device';
          const reprompt = 'on';

          this.response.speak(speechOutput).listen(reprompt);
          this.emit(':responseReady');
        }).bind(this));
      }
    },// TurnOn
    'TurnOff': function () {
      console.log("TurnOff");

      if (this.event.request.dialogState === 'STARTED') {
        var updatedIntent = this.event.request.intent;
        console.log(updatedIntent.slots);

        this.emit(':delegate', updatedIntent);
      } else if (this.event.request.dialogState !== 'COMPLETED'){
        this.emit(':delegate');
      } else {
        var updatedIntent = this.event.request.intent;

        //console.log(updatedIntent.slots);

        const deviceId = updatedIntent.slots.deviceId.value;

        handlePower(deviceId, SL_API_POWER_OFF, DEFAULT_POWER_LEVEL, (function(error, resultObject){
          const speechOutput = 'turn off the ' + deviceId + ' device';
          const reprompt = 'off';

          this.response.speak(speechOutput).listen(reprompt);
          this.emit(':responseReady');
        }).bind(this));
      }
    },// TurnOff
    'AdjustPowerLevel': function () {
      console.log("AdjustPowerLevel");

      const speechOutput = 'Which device?';
      const reprompt = 'off';

      this.response.speak(speechOutput).listen(reprompt);
      this.emit(':responseReady');
    },// AdjustPowerLevel
    'SetPowerLevel': function () {
      console.log("SetPowerLevel");

      if (this.event.request.dialogState === 'STARTED') {
        var updatedIntent = this.event.request.intent;
        console.log(updatedIntent.slots);

        this.emit(':delegate', updatedIntent);
      } else if (this.event.request.dialogState !== 'COMPLETED'){
        this.emit(':delegate');
      } else {
        var updatedIntent = this.event.request.intent;

        //console.log(updatedIntent.slots);

        const deviceId = updatedIntent.slots.deviceId.value;
        const powerLevel = updatedIntent.slots.powerLevel.value;

        handlePower(deviceId, SL_API_POWER_ON, powerLevel, (function(error, resultObject){
          const speechOutput = 'set the ' + deviceId + ' device power level ' + powerLevel;
          const reprompt = 'set';

          this.response.speak(speechOutput).listen(reprompt);
          this.emit(':responseReady');
        }).bind(this));
      }
    },// SetPowerLevel
    'AdjustBrightness': function () {
      console.log("AdjustBrightness");

      const speechOutput = 'How much?';
      const reprompt = 'OK';

      this.response.speak(speechOutput).listen(reprompt);
      this.emit(':responseReady');
    },// AdjustBrightness
    'SetBrightness': function () {
      console.log("SetBrightness");

      if (this.event.request.dialogState === 'STARTED') {
        var updatedIntent = this.event.request.intent;
        console.log(updatedIntent.slots);

        this.emit(':delegate', updatedIntent);
      } else if (this.event.request.dialogState !== 'COMPLETED'){
        this.emit(':delegate');
      } else {
        var updatedIntent = this.event.request.intent;

        //console.log(updatedIntent.slots);

        const deviceId = updatedIntent.slots.deviceId.value;
        const brightness = updatedIntent.slots.brightness.value;

        setBrightness(deviceId, brightness, (function(error, resultObject){
          const speechOutput = 'set the ' + deviceId + ' device brightness ' + brightness;
          const reprompt = 'set';

          this.response.speak(speechOutput).listen(reprompt);
          this.emit(':responseReady');
        }).bind(this));
      }
    },// SetBrightness
    'SetColor': function () {
      console.log("SetColor");

      if (this.event.request.dialogState === 'STARTED') {
        var updatedIntent = this.event.request.intent;
        console.log(updatedIntent.slots);

        this.emit(':delegate', updatedIntent);
      } else if (this.event.request.dialogState !== 'COMPLETED'){
        this.emit(':delegate');
      } else {
        var updatedIntent = this.event.request.intent;

        //console.log(updatedIntent.slots);

        const deviceId = updatedIntent.slots.deviceId.value;
        const color = updatedIntent.slots.color.value;

        handleColor(deviceId, color, (function(error, resultObject){
          const speechOutput = 'set the ' + deviceId + ' device color ' + color;
          const reprompt = 'set';

          this.response.speak(speechOutput).listen(reprompt);
          this.emit(':responseReady');
        }).bind(this));
      }
    },// SetColor
    'DecreaseColorTemperature': function () {
      console.log("DecreaseColorTemperature");

      if (this.event.request.dialogState === 'STARTED') {
        var updatedIntent = this.event.request.intent;
        console.log(updatedIntent.slots);

        this.emit(':delegate', updatedIntent);
      } else if (this.event.request.dialogState !== 'COMPLETED'){
        this.emit(':delegate');
      } else {
        var updatedIntent = this.event.request.intent;

        //console.log(updatedIntent.slots);

        const deviceId = updatedIntent.slots.deviceId.value;

        adjustColorTemperature(deviceId, DECREASE_CODE, (function(error, resultObject){
          const colorTemperature = resultObject.data.colorTemperature;

          const speechOutput = 'set the ' + deviceId + ' device color temperature ' + colorTemperature;
          const reprompt = 'set';

          this.response.speak(speechOutput).listen(reprompt);
          this.emit(':responseReady');
        }).bind(this));
      }
    },// DecreaseColorTemperature
    'IncreaseColorTemperature': function () {
      console.log("IncreaseColorTemperature");

      if (this.event.request.dialogState === 'STARTED') {
        var updatedIntent = this.event.request.intent;
        console.log(updatedIntent.slots);

        this.emit(':delegate', updatedIntent);
      } else if (this.event.request.dialogState !== 'COMPLETED'){
        this.emit(':delegate');
      } else {
        var updatedIntent = this.event.request.intent;

        //console.log(updatedIntent.slots);

        const deviceId = updatedIntent.slots.deviceId.value;

        adjustColorTemperature(deviceId, INCREASE_CODE, (function(error, resultObject){
          const colorTemperature = resultObject.data.colorTemperature;

          const speechOutput = 'set the ' + deviceId + ' device color temperature ' + colorTemperature;
          const reprompt = 'set';

          this.response.speak(speechOutput).listen(reprompt);
          this.emit(':responseReady');
        }).bind(this));
      }
    },// IncreaseColorTemperature
    'SetColorTemperature': function () {
      console.log("SetColorTemperature");

      if (this.event.request.dialogState === 'STARTED') {
        var updatedIntent = this.event.request.intent;
        console.log(updatedIntent.slots);

        this.emit(':delegate', updatedIntent);
      } else if (this.event.request.dialogState !== 'COMPLETED'){
        this.emit(':delegate');
      } else {
        var updatedIntent = this.event.request.intent;

        //console.log(updatedIntent.slots);

        const deviceId = updatedIntent.slots.deviceId.value;
        const colorTemperature = updatedIntent.slots.colorTemperature.value;

        setColorTemperature(deviceId, colorTemperature, (function(error, resultObject){
          const speechOutput = 'set the ' + deviceId + ' device color temperature ' + colorTemperature;
          const reprompt = 'set';

          this.response.speak(speechOutput).listen(reprompt);
          this.emit(':responseReady');
        }).bind(this));
      }
    },// SetColorTemperature
    'Unhandled': function () {
      console.log("Unhandled");

      this.emit(':ask', 'What would you like to do?', 'Please say that again?');
    }// Unhandled
};// LightHandlers



function handlePower(deviceId, onoff, level, callback){
  console.log("handlePower");

  var resultObject = {};

  // make query
  const gatewayUrl = BASE_URL + "/device/" + deviceId + "/light";

  var body = {};
  body.onoff = onoff;
  body.level = level;

  var data = {
    url: gatewayUrl,
    form: body
  }

  // request gateway
  request.put(data, function(error, httpResponse, body){
    console.log(body);

    resultObject.code = SL_API_SUCCESS_CODE;
    resultObject.message = "success";

    callback(null, resultObject);
  });
}// handlePower

function setBrightness(deviceId, brightness, callback){
  console.log("setBrightness");

  var resultObject = {};

  // Request query
  const gatewayUrl = BASE_URL + "/device/" + deviceId + "/light";

  const onoff = SL_API_POWER_ON;
  const level = DEFAULT_POWER_LEVEL;

  var body = {};
  body.onoff = onoff;
  body.level = level;

  // brightness
  body.brightness = brightness;

  var data = {
    url: gatewayUrl,
    form: body
  }

  // request gateway
  request.put(data, function(error, httpResponse, body){
    console.log(body);

    resultObject.code = SL_API_SUCCESS_CODE;
    resultObject.message = "success";

    callback(null, resultObject);
  });
}// setBrightness


function handleColor(deviceId, color, callback){
  console.log("handleColorControl");

  var resultObject = {};

  // Request query
  const gatewayUrl = BASE_URL + "/device/" + deviceId + "/light";

  const onoff = SL_API_POWER_ON;
  const level = DEFAULT_POWER_LEVEL;

  var body = {};
  body.onoff = onoff;
  body.level = level;


  // color
  try {
    const colorHSL = colorConverter.keyword.hsl(color);

    console.log("colorHSL : ", colorHSL);

    body.hue = colorHSL[0];
    body.saturation = colorHSL[1];
    body.brightness = colorHSL[2];

    var data = {
      url: gatewayUrl,
      form: body
    }

    // request gateway
    request.put(data, function(error, httpResponse, body){
      console.log(body);

      resultObject.code = SL_API_SUCCESS_CODE;
      resultObject.message = "success";

      callback(null, resultObject);
    });

  } catch(error){
    console.log("Error", error);

    resultObject.code = SL_API_FAILURE_CODE;
    resultObject.message = "failure";

    callback(true, resultObject);
  }
}// handleColorControl

function adjustColorTemperature(deviceId, code, callback) {
  console.log("adjustColorTemperature");

  var resultObject = {};

  var colorTemperature = 0;
  var preColorTemperature = 0;
  var preOnOff = "on";
  var prePowerLevel = 1000;

  async.waterfall([
    function(callback){
      // Request query
      const gatewayUrl = BASE_URL + "/device/" + deviceId + "/light";

      var data = {
        url: gatewayUrl
      }

      // request gateway
      request.get(data, function(error, httpResponse, body){
        console.log(body);
        console.log(body.result_data);

        var dataObject = JSON.parse(body);

        preColorTemperature = dataObject.result_data.colorTemp;
        preOnOff = dataObject.result_data.onoff;
        prePowerLevel = dataObject.result_data.level;

        callback(null, preColorTemperature);
      });
    },
    function(preColorTemperature, callback){
      // TODO modify equation
      switch (code) {
        case INCREASE_CODE:
          colorTemperature = preColorTemperature * INCREASE_RATE;

          break;
        case DECREASE_CODE:
          colorTemperature = preColorTemperature * DECREASE_RATE;

          break;
        default:
          colorTemperature = preColorTemperature * DEFAULT_RATE;

          break;
      }

      const gatewayUrl = BASE_URL + "/device/" + deviceId + "/light";

      var body = {};
      body.onoff = preOnOff;
      body.level = prePowerLevel;

      // color
      body.colorTemp = colorTemperature;

      var data = {
        url: gatewayUrl,
        form: body
      }

      // request gateway
      request.put(data, function(error, httpResponse, body){
        console.log(body);

        callback(null, null);
      });
    }
  ], function(error, result){
    resultObject.code = SL_API_SUCCESS_CODE;
    resultObject.message = "success";

    var data = {
      colorTemperature: colorTemperature
    }

    resultObject.data = data;

    callback(null, resultObject);
  });
}// adjustColorTemperature

function setColorTemperature(deviceId, colorTemperature, callback){
  console.log("setColorTemperature");

  var resultObject = {};

  // Request query
  const gatewayUrl = BASE_URL + "/device/" + deviceId + "/light";

  const onoff = SL_API_POWER_ON;
  const level = DEFAULT_POWER_LEVEL;

  const colorTemperatureInKelvin = colorTemperature;

  var body = {};
  body.onoff = onoff;
  body.level = level;

  // color
  body.colorTemp = colorTemperatureInKelvin;

  var data = {
    url: gatewayUrl,
    form: body
  }

  // request gateway
  request.put(data, function(error, httpResponse, body){
    console.log(body);

    resultObject.code = SL_API_SUCCESS_CODE;
    resultObject.message = "success";

    callback(null, resultObject);
  });
}// setColorTemperature
