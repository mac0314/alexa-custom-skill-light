
'use strict';


/***********
 modules
********* */
const Alexa = require("alexa-sdk");
const config = require("config.json")("./config/config.json");
const request = require("request");


// system light API parameters
const SL_API_POWER_ON = "on";
const SL_API_POWER_OFF = "off";

const DEFAULT_POWER_LEVEL = 1000;


const SL_API_SUCCESS_CODE = 200;
const SL_API_FAILURE_CODE = 400;


// TEMP Gateway IP URL
const BASE_URL = config.sl.gw;

// Alexa Skill App ID
const appId = config.alexa.appId;


// entry
exports.handler = function(event, context, callback) {
  //console.log(event);

  const alexa = Alexa.handler(event, context);

  alexa.appId = appId;

  alexa.registerHandlers(builtInHandlers, LightHandlers);

  alexa.execute();
};

const builtInHandlers = {
  'LaunchRequest': function () {
    console.log("LaunchRequest");

    const speechOutput = 'Hi, there, This is system light skill app!';
    const reprompt = 'Ask me.';

    this.response.speak(speechOutput).listen(reprompt);
    this.emit(':responseReady');
  },
  'AMAZON.HelpIntent': function () {
    console.log("HelpIntent");
    const speechOutput = 'This is alexa custom skill for system light 2.0.';
    const reprompt = 'Say hello, to hear me speak.';

    this.response.speak(speechOutput).listen(reprompt);
    this.emit(':responseReady');
  },
  'AMAZON.CancelIntent': function () {
    console.log("CancelIntent");
    this.response.speak('Goodbye!');
    this.emit(':responseReady');
  },
  'AMAZON.StopIntent': function () {
    console.log("StopIntent");
    this.response.speak('See you later!');
    this.emit(':responseReady');
  }
}

const LightHandlers = {
    'Discover': function () {
      console.log("Discover");
      const speechOutput = 'Which device?';
      const reprompt = 'off';

      this.response.speak(speechOutput).listen(reprompt);
      this.emit(':responseReady');
    },
    'TurnOn': function () {
      console.log("TurnOn");
      if (this.event.request.dialogState === 'STARTED') {
        var updatedIntent = this.event.request.intent;
        console.log(updatedIntent.slots);

        this.emit(':delegate', updatedIntent);
      } else if (this.event.request.dialogState !== 'COMPLETED'){
        this.emit(':delegate');
      } else {
        var that = this;
        var updatedIntent = this.event.request.intent;

        //console.log(updatedIntent.slots);

        const deviceId = updatedIntent.slots.deviceId.value;

        handlePower(deviceId, SL_API_POWER_ON, DEFAULT_POWER_LEVEL, (function(error, resultObject){
          const speechOutput = 'turn on the device ' + deviceId;
          const reprompt = 'on';

          this.response.speak(speechOutput).listen(reprompt);
          this.emit(':responseReady');
        }).bind(this));
      }
    },
    'TurnOff': function () {
      console.log("TurnOff");
      if (this.event.request.dialogState === 'STARTED') {
        var updatedIntent = this.event.request.intent;
        console.log(updatedIntent.slots);

        this.emit(':delegate', updatedIntent);
      } else if (this.event.request.dialogState !== 'COMPLETED'){
        this.emit(':delegate');
      } else {
        var that = this;
        var updatedIntent = this.event.request.intent;

        //console.log(updatedIntent.slots);

        const deviceId = updatedIntent.slots.deviceId.value;

        handlePower(deviceId, SL_API_POWER_OFF, DEFAULT_POWER_LEVEL, function(error, resultObject){
          const speechOutput = 'turn off the device ' + deviceId;
          const reprompt = 'off';

          this.response.speak(speechOutput).listen(reprompt);
          this.emit(':responseReady');
        }).bind(this));
      }
    },
    'AdjustPowerLevel': function () {
      console.log("AdjustPowerLevel");
      const speechOutput = 'Which device?';
      const reprompt = 'off';

      this.response.speak(speechOutput).listen(reprompt);
      this.emit(':responseReady');
    },
    'SetPowerLevel': function () {
      console.log("SetPowerLevel");
      const speechOutput = 'Which device?';
      const reprompt = 'off';

      this.response.speak(speechOutput).listen(reprompt);
      this.emit(':responseReady');
    },
    'AdjustBrightness': function () {
      console.log("AdjustBrightness");
      const speechOutput = 'How much?';
      const reprompt = 'OK';

      this.response.speak(speechOutput).listen(reprompt);
      this.emit(':responseReady');
    },
    'SetBrightness': function () {
      console.log("SetBrightness");
      const speechOutput = 'How much?';
      const reprompt = 'OK';

      this.response.speak(speechOutput).listen(reprompt);
      this.emit(':responseReady');
    },
    'SetColor': function () {
      console.log("SetColor");
      const speechOutput = 'What color?';
      const reprompt = 'OK';

      this.response.speak(speechOutput).listen(reprompt);
      this.emit(':responseReady');
    },
    'DecreaseColorTemperature': function () {
      console.log("DecreaseColorTemperature");
      const speechOutput = 'OK';

      this.response.speak(speechOutput);
      this.emit(':responseReady');
    },
    'IncreaseColorTemperature': function () {
      console.log("IncreaseColorTemperature");
      const speechOutput = 'OK';

      this.response.speak(speechOutput);
      this.emit(':responseReady');
    },
    'SetColorTemperature': function () {
      console.log("SetColorTemperature");
      const speechOutput = 'What degree?';
      const reprompt = 'OK';

      this.response.speak(speechOutput).listen(reprompt);
      this.emit(':responseReady');
    }
};




function handlePower(deviceId, onoff, level, callback){
  console.log("handlePower");
  var resultObject = {};

  // make query
  const lightUrl = BASE_URL + "/device/" + deviceId + "/light";

  var body = {};
  body.onoff = onoff;
  body.level = level;

  var data = {
    url: lightUrl,
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
