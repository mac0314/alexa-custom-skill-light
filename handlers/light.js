
/***********
 modules
********* */
const config = require("config.json")("./config/config.json");

const brightnessCTRL = require('../controllers/brightness');
const colorTempCTRL = require('../controllers/color_temperature');
const colorCTRL = require('../controllers/color');
const discoverCTRL = require('../controllers/discover');
const powerCTRL = require('../controllers/power');

const constants = require('../lib/constants');


module.exports = {
  'Discover': function () {
    console.log("Discover");

    if (this.event.request.dialogState === 'STARTED') {
      var updatedIntent = this.event.request.intent;

      this.emit(':delegate', updatedIntent);
    } else if (this.event.request.dialogState !== 'COMPLETED'){
      this.emit(':delegate');
    } else {
      discoverCTRL.discover(0, (function(error, resultObject){
        var speechOutput = "";
        var deviceNameList = resultObject.data.deviceNameList;

        console.log(deviceNameList);

        if(deviceNameList.length > 0){
          speechOutput = "Find the devices, " + deviceNameList.join(" ") + "!";
        }else{
          speechOutput = "Don't find any device."
        }

        this.response.speak(speechOutput);
        this.emit(':responseReady');
      }).bind(this));
    }
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

      console.log(updatedIntent.slots);

      const deviceId = updatedIntent.slots.deviceId.value;

      powerCTRL.handlePower(deviceId, constants.SL_API_POWER_ON, constants.DEFAULT_POWER_LEVEL, (function(error, resultObject){
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

      console.log(updatedIntent.slots);

      const deviceId = updatedIntent.slots.deviceId.value;

      powerCTRL.handlePower(deviceId, constants.SL_API_POWER_OFF, constants.DEFAULT_POWER_LEVEL, (function(error, resultObject){
        const speechOutput = 'turn off the ' + deviceId + ' device';
        const reprompt = 'off';

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
      }).bind(this));
    }
  },// TurnOff
  'AdjustPowerLevel': function () {
    console.log("AdjustPowerLevel");

    if (this.event.request.dialogState === 'STARTED') {
      var updatedIntent = this.event.request.intent;
      console.log(updatedIntent.slots);

      this.emit(':delegate', updatedIntent);
    } else if (this.event.request.dialogState !== 'COMPLETED'){
      this.emit(':delegate');
    } else {
      var updatedIntent = this.event.request.intent;

      console.log(updatedIntent.slots);

      const deviceId = updatedIntent.slots.deviceId.value;
      const command = updatedIntent.slots.command.resolutions.resolutionsPerAuthority[0].values[0].value.name;


      powerCTRL.adjustPowerLevel(deviceId, command, (function(error, resultObject){
        const powerLevel = resultObject.data.powerLevel;

        const speechOutput = command + ', set the ' + deviceId + ' device power level ' + powerLevel;
        const reprompt = 'set';

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
      }).bind(this));
    }
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

      console.log(updatedIntent.slots);

      const deviceId = updatedIntent.slots.deviceId.value;
      const powerLevel = updatedIntent.slots.powerLevel.value;

      powerCTRL.handlePower(deviceId, constants.SL_API_POWER_ON, powerLevel, (function(error, resultObject){
        const speechOutput = 'set the ' + deviceId + ' device power level ' + powerLevel;
        const reprompt = 'set';

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
      }).bind(this));
    }
  },// SetPowerLevel
  'AdjustBrightness': function () {
    console.log("AdjustBrightness");

    if (this.event.request.dialogState === 'STARTED') {
      var updatedIntent = this.event.request.intent;
      console.log(updatedIntent.slots);

      this.emit(':delegate', updatedIntent);
    } else if (this.event.request.dialogState !== 'COMPLETED'){
      this.emit(':delegate');
    } else {
      var updatedIntent = this.event.request.intent;

      console.log(updatedIntent.slots);

      const deviceId = updatedIntent.slots.deviceId.value;
      const command = updatedIntent.slots.command.resolutions.resolutionsPerAuthority[0].values[0].value.name;


      brightnessCTRL.adjustBrightness(deviceId, command, (function(error, resultObject){
        const brightness = resultObject.data.brightness;

        const speechOutput = command + ', set the ' + deviceId + ' device brightness ' + brightness;
        const reprompt = 'set';

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
      }).bind(this));
    }
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

      console.log(updatedIntent.slots);

      const deviceId = updatedIntent.slots.deviceId.value;
      const brightness = updatedIntent.slots.brightness.value;

      brightnessCTRL.setBrightness(deviceId, brightness, (function(error, resultObject){
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

      console.log(updatedIntent.slots);

      const deviceId = updatedIntent.slots.deviceId.value;
      const color = updatedIntent.slots.color.value;

      colorCTRL.handleColor(deviceId, color, (function(error, resultObject){
        const speechOutput = 'set the ' + deviceId + ' device color ' + color;
        const reprompt = 'set';

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
      }).bind(this));
    }
  },// SetColor
  'AdjustColorTemperature': function () {
    console.log("AdjustColorTemperature");

    if (this.event.request.dialogState === 'STARTED') {
      var updatedIntent = this.event.request.intent;
      console.log(updatedIntent.slots);

      this.emit(':delegate', updatedIntent);
    } else if (this.event.request.dialogState !== 'COMPLETED'){
      this.emit(':delegate');
    } else {
      var updatedIntent = this.event.request.intent;

      const deviceId = updatedIntent.slots.deviceId.value;
      const command = updatedIntent.slots.command.resolutions.resolutionsPerAuthority[0].values[0].value.name;

      colorTempCTRL.adjustColorTemperature(deviceId, command, (function(error, resultObject){
        const colorTemperature = resultObject.data.colorTemperature;

        const speechOutput = command + ', set the ' + deviceId + ' device color temperature ' + colorTemperature;
        const reprompt = 'set';

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
      }).bind(this));
    }
  },// AdjustColorTemperature
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

      console.log(updatedIntent.slots);

      const deviceId = updatedIntent.slots.deviceId.value;
      const colorTemperature = updatdIntent.slots.colorTemperature.value;

      colorTempCTRL.setColorTemperature(deviceId, colorTemperature, (function(error, resultObject){
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
};// LightHandler
