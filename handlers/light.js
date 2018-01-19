
/***********
 modules
********* */
const config = require("config.json")("./config/config.json");

const brightnessCTRL = require('../controllers/brightness');
const colorTempCTRL = require('../controllers/color_temperature');
const colorCTRL = require('../controllers/color');
const discoverCTRL = require('../controllers/discover');
const powerCTRL = require('../controllers/power');
const unitCTRL = require('../controllers/unit');

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

        const deviceNum = deviceNameList.length;

        if(deviceNum > 1){
          speechOutput = "Find the devices, " + deviceNameList.join(" ") + "!";
          const reprompt = 'Do you want to control the devices?';

          this.response.speak(speechOutput).listen(reprompt);
        }else if(deviceNum == 1){
          speechOutput = "Find the device, " + deviceNameList[0] + "!";
          const reprompt = 'Do you want to control the device?';

          this.response.speak(speechOutput).listen(reprompt);
        }else{
          speechOutput = "Don't find any device.";

          this.response.speak(speechOutput);
        }
        this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

        const key = constants.TABLE_USER_DEVICES;

        console.log(this.attributes);


        this.attributes[key] = deviceNameList;

        console.log(this.attributes[key]);

        this.emit(':saveState', true);
      }).bind(this));
    }
  },// Discover
  'ManageUnit': function () {
    console.log("ManageUnit");

    if (this.event.request.dialogState === 'STARTED') {
      var updatedIntent = this.event.request.intent;
      console.log(updatedIntent.slots);

      this.emit(':delegate', updatedIntent);
    } else if (this.event.request.dialogState !== 'COMPLETED'){
      this.emit(':delegate');
    } else {
      var updatedIntent = this.event.request.intent;

      console.log(updatedIntent.slots);

      const crudType = updatedIntent.slots.crudType.resolutions.resolutionsPerAuthority[0].values[0].value.name;
      const unit = updatedIntent.slots.unit.resolutions.resolutionsPerAuthority[0].values[0].value.name;
      const unitId = updatedIntent.slots.unitId.value;


      unitCTRL.manageUnit(unit, unitId, crudType, (function(error, resultObject){
        const speechOutput = crudType + ' the ' + unitId + ' ' + unit;

        this.response.speak(speechOutput);
        this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

        this.emit(':responseReady');
      }).bind(this));
    }
  },// ManageUnit
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

      const unit = updatedIntent.slots.unit.resolutions.resolutionsPerAuthority[0].values[0].value.name;
      const unitId = updatedIntent.slots.unitId.value;


      powerCTRL.handlePower(unit, unitId, constants.SL_API_POWER_ON, constants.DEFAULT_POWER_LEVEL, (function(error, resultObject){
        const speechOutput = 'turn on the ' + unitId + ' ' + unit;

        this.response.speak(speechOutput);
        this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

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

      const unit = updatedIntent.slots.unit.resolutions.resolutionsPerAuthority[0].values[0].value.name;
      const unitId = updatedIntent.slots.unitId.value;

      powerCTRL.handlePower(unit, unitId, constants.SL_API_POWER_OFF, constants.DEFAULT_POWER_LEVEL, (function(error, resultObject){
        const speechOutput = 'turn off the ' + unitId + ' ' + unit;

        this.response.speak(speechOutput);
        this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

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

      const command = updatedIntent.slots.command.resolutions.resolutionsPerAuthority[0].values[0].value.name;
      const unit = updatedIntent.slots.unit.resolutions.resolutionsPerAuthority[0].values[0].value.name;
      const unitId = updatedIntent.slots.unitId.value;


      powerCTRL.adjustPowerLevel(unit, unitId, command, (function(error, resultObject){
        const powerLevel = resultObject.data.powerLevel;

        const speechOutput = command + ', set the ' + unitId + ' ' + unit + ' power level ' + powerLevel;
        const reprompt = 'Do you want to Change more?'

        this.response.speak(speechOutput).listen(reprompt);
        this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

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

      const unit = updatedIntent.slots.unit.resolutions.resolutionsPerAuthority[0].values[0].value.name;
      const unitId = updatedIntent.slots.unitId.value;
      const powerLevel = updatedIntent.slots.powerLevel.value;

      powerCTRL.handlePower(unit, unitId, constants.SL_API_POWER_ON, powerLevel, (function(error, resultObject){
        const speechOutput = 'set the ' + unitId + ' ' + unit + ' power level ' + powerLevel;

        this.response.speak(speechOutput);
        this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

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

      const command = updatedIntent.slots.command.resolutions.resolutionsPerAuthority[0].values[0].value.name;
      const unit = updatedIntent.slots.unit.resolutions.resolutionsPerAuthority[0].values[0].value.name;
      const unitId = updatedIntent.slots.unitId.value;


      brightnessCTRL.adjustBrightness(unit, unitId, command, (function(error, resultObject){
        const brightness = resultObject.data.brightness;

        const speechOutput = command + ', set the ' + unitId + ' ' + unit + ' brightness ' + brightness;
        const reprompt = 'Do you want to Change more?'

        this.response.speak(speechOutput).listen(reprompt);
        this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

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

      const unit = updatedIntent.slots.unit.resolutions.resolutionsPerAuthority[0].values[0].value.name;
      const unitId = updatedIntent.slots.unitId.value;
      const brightness = updatedIntent.slots.brightness.value;

      brightnessCTRL.setBrightness(unit, unitId, brightness, (function(error, resultObject){
        const speechOutput = 'set the ' + unitId + ' ' + unit + ' brightness ' + brightness;

        this.response.speak(speechOutput);
        this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

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

      const unit = updatedIntent.slots.unit.resolutions.resolutionsPerAuthority[0].values[0].value.name;
      const unitId = updatedIntent.slots.unitId.value;
      const color = updatedIntent.slots.color.value;

      colorCTRL.handleColor(unit, unitId, color, (function(error, resultObject){
        const speechOutput = 'set the ' + unitId + ' ' + unit + ' color ' + color;

        this.response.speak(speechOutput);
        this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

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

      const command = updatedIntent.slots.command.resolutions.resolutionsPerAuthority[0].values[0].value.name;
      const unit = updatedIntent.slots.unit.resolutions.resolutionsPerAuthority[0].values[0].value.name;
      const unitId = updatedIntent.slots.unitId.value;

      colorTempCTRL.adjustColorTemperature(unit, unitId, command, (function(error, resultObject){
        const colorTemperature = resultObject.data.colorTemperature;

        const speechOutput = command + ', set the ' + unitId + ' ' + unit + ' color temperature ' + colorTemperature;
        const reprompt = 'Do you want to Change more?'

        this.response.speak(speechOutput).listen(reprompt);
        this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

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

      const unit = updatedIntent.slots.unit.resolutions.resolutionsPerAuthority[0].values[0].value.name;
      const unitId = updatedIntent.slots.unitId.value;
      const colorTemperature = updatdIntent.slots.colorTemperature.value;

      colorTempCTRL.setColorTemperature(unit, unitId, colorTemperature, (function(error, resultObject){
        const speechOutput = 'set the ' + unitId + ' ' + unit + ' color temperature ' + colorTemperature;

        this.response.speak(speechOutput);
        this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

        this.emit(':responseReady');
      }).bind(this));
    }
  },// SetColorTemperature
  'Unhandled': function () {
    console.log("Unhandled");

    this.emit(':ask', 'What would you like to do?', 'Please say that again?');
  }// Unhandled
};// LightHandler
