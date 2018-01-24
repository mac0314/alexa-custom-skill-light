
/***********
 modules
********* */
const config = require("config.json")("./config/config.json");

const brightnessCTRL = require('../controllers/light/brightness');
const colorTempCTRL = require('../controllers/light/color_temperature');
const colorCTRL = require('../controllers/light/color');
const discoverCTRL = require('../controllers/light/discover');
const powerCTRL = require('../controllers/light/power');
const lightCTRL = require('../controllers/light/index');

const constants = require('../lib/constants');


module.exports = {
  'DiscoverGateways': function () {
    console.log("DiscoverGateway");

    discoverCTRL.discoverGateways((function(error, resultObject){
      const response = resultObject.data.response;
      const gateway = resultObject.data.gateway;

      switch (response.type) {
        case constants.RESPONSE_SPEAK:
          this.response.speak(response.speechOutput);
          break;
        case constants.RESPONSE_SPEAK_AND_LISTEN:
          this.response.speak(response.speechOutput).listen(response.reprompt);
          break;
        default:
          break;
      }
      this.response.cardRenderer(global.APP_NAME, response.speechOutput, constants.BACKGROUND_IMAGE);

      var key = constants.TABLE_USER_GATEWAY_FLAG;

      if(gateway === null){
        this.attributes[key] = false;

        key = constants.TABLE_USER_LIGHTS_FLAG;
        this.attributes[key] = false;
        key = constants.TABLE_USER_GATEWAY;
        delete this.attributes[key];
        key = constants.TABLE_USER_LIGHTS;
        delete this.attributes[key];
        key = constants.TABLE_USER_GROUP_LIST;
        delete this.attributes[key];

      }else{
        this.attributes[key] = true;

        key = constants.TABLE_USER_GATEWAY;
        this.attributes[key] = gateway;
      }

      this.emit(':saveState', true);
    }).bind(this));
  },// DiscoverGateways
  'DiscoverLights': function () {
    console.log("DiscoverLights");

    var key = constants.TABLE_USER_GATEWAY;
    const gatewayObject = this.attributes[key];

    if(gatewayObject === undefined){
      const speechOutput = "First, you must discover your gateway!";
      this.response.speak(speechOutput);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

      this.emit(':responseReady');
    }else{
      discoverCTRL.discoverLights(gatewayObject, (function(error, resultObject){
        const response = resultObject.data.response;
        const lightList = resultObject.data.lightList;

        switch (response.type) {
          case constants.RESPONSE_SPEAK:
            this.response.speak(response.speechOutput);
            break;
          case constants.RESPONSE_SPEAK_AND_LISTEN:
            this.response.speak(response.speechOutput).listen(response.reprompt);
            break;
          default:
            break;
        }
        this.response.cardRenderer(global.APP_NAME, response.speechOutput, constants.BACKGROUND_IMAGE);


        key = constants.TABLE_USER_LIGHTS_FLAG;
        if(lightList.length === 0){
          this.attributes[key] = false;
        }else{
          this.attributes[key] = true;

          key = constants.TABLE_USER_LIGHTS;
          this.attributes[key] = lightList;
        }

        this.emit(':saveState', true);
      }).bind(this));
    }
  },// DiscoverLights
  'TurnOn': function () {
    console.log("TurnOn");

    var key = constants.TABLE_USER_LIGHTS_FLAG;
    const flag = this.attributes[key];

    if(flag){
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
    }else{
      const speechOutput = "First, you must discover your lights!";
      this.response.speak(speechOutput);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

      this.emit(':responseReady');
    }
  },// TurnOn
  'TurnOff': function () {
    console.log("TurnOff");

    var key = constants.TABLE_USER_LIGHTS_FLAG;
    const flag = this.attributes[key];

    if(flag){
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
    }else{
      const speechOutput = "First, you must discover your lights!";
      this.response.speak(speechOutput);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

      this.emit(':responseReady');
    }
  },// TurnOff
  'AdjustPowerLevel': function () {
    console.log("AdjustPowerLevel");

    var key = constants.TABLE_USER_LIGHTS_FLAG;
    const flag = this.attributes[key];

    if(flag){
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
    }else{
      const speechOutput = "First, you must discover your lights!";
      this.response.speak(speechOutput);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

      this.emit(':responseReady');
    }
  },// AdjustPowerLevel
  'SetPowerLevel': function () {
    console.log("SetPowerLevel");

    var key = constants.TABLE_USER_LIGHTS_FLAG;
    const flag = this.attributes[key];

    if(flag){
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
    }else{
      const speechOutput = "First, you must discover your lights!";
      this.response.speak(speechOutput);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

      this.emit(':responseReady');
    }
  },// SetPowerLevel
  'AdjustBrightness': function () {
    console.log("AdjustBrightness");

    var key = constants.TABLE_USER_LIGHTS_FLAG;
    const flag = this.attributes[key];

    if(flag){
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
    }else{
      const speechOutput = "First, you must discover your lights!";
      this.response.speak(speechOutput);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

      this.emit(':responseReady');
    }
  },// AdjustBrightness
  'SetBrightness': function () {
    console.log("SetBrightness");

    var key = constants.TABLE_USER_LIGHTS_FLAG;
    const flag = this.attributes[key];

    if(flag){
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
    }else{
      const speechOutput = "First, you must discover your lights!";
      this.response.speak(speechOutput);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

      this.emit(':responseReady');
    }
  },// SetBrightness
  'SetColor': function () {
    console.log("SetColor");

    var key = constants.TABLE_USER_LIGHTS_FLAG;
    const flag = this.attributes[key];

    if(flag){
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
    }else{
      const speechOutput = "First, you must discover your lights!";
      this.response.speak(speechOutput);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

      this.emit(':responseReady');
    }
  },// SetColor
  'AdjustColorTemperature': function () {
    console.log("AdjustColorTemperature");

    var key = constants.TABLE_USER_LIGHTS_FLAG;
    const flag = this.attributes[key];

    if(flag){
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
    }else{
      const speechOutput = "First, you must discover your lights!";
      this.response.speak(speechOutput);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

      this.emit(':responseReady');
    }
  },// AdjustColorTemperature
  'SetColorTemperature': function () {
    console.log("SetColorTemperature");

    var key = constants.TABLE_USER_LIGHTS_FLAG;
    const flag = this.attributes[key];

    if(flag){
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
    }else{
      const speechOutput = "First, you must discover your lights!";
      this.response.speak(speechOutput);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

      this.emit(':responseReady');
    }
  },// SetColorTemperature
  'Unhandled': function () {
    console.log("Unhandled");

    this.emit(':ask', 'What would you like to do?', 'Please say that again?');
  }// Unhandled
};// LightHandler
