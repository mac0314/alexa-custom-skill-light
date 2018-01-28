
/***********
 modules
********* */
const Alexa = require("alexa-sdk");

// utility methods for creating Image and TextField objects
const makePlainText = Alexa.utils.TextUtils.makePlainText;
const makeImage = Alexa.utils.ImageUtils.makeImage;


const config = require("config.json")("./config/config.json");

const brightnessCTRL = require('../controllers/light/brightness');
const colorTempCTRL = require('../controllers/light/color_temperature');
const colorCTRL = require('../controllers/light/color');
const powerCTRL = require('../controllers/light/power');

const constants = require('../lib/constants');

var mqtt = require('mqtt');

var url = config.aws.amazonMQ.mqtt.url + ":" + config.aws.amazonMQ.mqtt.port;
var option = {
  username : config.aws.amazonMQ.user.name,
  password : config.aws.amazonMQ.user.password
}
var client  = mqtt.connect(url, option);

const requestTopic = constants.MQTT_REQUEST_TOPIC;



module.exports = {
  'TurnOn': function () {
    console.log("TurnOn");

    // Echo Show Display
    const builder = new Alexa.templateBuilders.BodyTemplate1Builder();

    var key = constants.TABLE_USER_GATEWAY;
    const gatewayObject = this.attributes[key];

    if(gatewayObject === undefined){
      const speechOutput = "First, you must discover your gateway!";
      const reprompt = "Tell me, if you want to discover gateway.";

      const template = builder.setTitle(global.APP_NAME)
                          .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                          .setTextContent(makePlainText(speechOutput))
                          .build();

      this.response.speak(speechOutput).listen(reprompt);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

      this.response.renderTemplate(template);

      this.emit(':responseReady');
    }else{
      var key = constants.TABLE_USER_LIGHT_FLAG;
      const flag = this.attributes[key];

      var unit = "";

      if(flag){
        if (this.event.request.dialogState === 'STARTED') {
          //console.log("STARTED");
          var updatedIntent = this.event.request.intent;
          var slots = updatedIntent.slots;


          if(slots.uSpaceName.hasOwnProperty("value")){
            const uSpaceName = slots.uSpaceName.value;

            var key = constants.TABLE_USER_UNIT_SPACE_PREFIX + uSpaceName;

            if(this.attributes[key]){
              if(slots.unit.hasOwnProperty("value")){

              }else{
                // default
                unit = "group";
                updatedIntent.slots.unit.value = unit;
              }


              this.emit(':delegate', updatedIntent);
            }else{
              const speechOutput = 'The space is not registered..';
              const reprompt = "Tell me if you want to do another thing.";


              const template = builder.setTitle(global.APP_NAME)
                                  .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                                  .setTextContent(makePlainText(speechOutput))
                                  .build();

              this.response.speak(speechOutput).listen(reprompt);
              this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

              this.response.renderTemplate(template);

              this.emit(':responseReady');
            }
          }else{
            this.emit(':delegate');
          }
        } else if (this.event.request.dialogState !== 'COMPLETED'){
          //console.log("!COMPLETED");
          this.emit(':delegate');
        } else {
          //console.log("COMPLETED");
          var updatedIntent = this.event.request.intent;
          var slots = updatedIntent.slots;

          const unitId = updatedIntent.slots.unitId.value;
          var uSpaceName = "";
          if(slots.uSpaceName.hasOwnProperty("value")){
            unit = updatedIntent.slots.unit.value;
            uSpaceName = slots.uSpaceName.value;
          }else{
            unit = updatedIntent.slots.unit.resolutions.resolutionsPerAuthority[0].values[0].value.name;
          }

          const key = constants.TABLE_USER_UNIT_SPACE_PREFIX + uSpaceName;
          var uSpaceId = this.attributes[key];


          if(global.PROTOCOL == "MQTT"){
            // MQTT request
            var messageObject = {};
            const intent = "TurnOn";
            const userId = this.event.session.user.userId;

            var contentObject = {};
            contentObject.gatewayObject = gatewayObject;
            contentObject.uSpaceId = uSpaceId;
            contentObject.unit = unit;
            contentObject.unitId = unitId;

            messageObject.intent = intent;
            messageObject.userId = userId;
            messageObject.contentObject = contentObject;


            client.publish(requestTopic, JSON.stringify(messageObject));

            const speechOutput = 'turn on the ' + uSpaceName + ' ' + unitId + ' ' + unit;
            const reprompt = "Tell me, if you want to control other light.";

            const template = builder.setTitle(global.APP_NAME)
                                .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                                .setTextContent(makePlainText(speechOutput))
                                .build();

            this.response.speak(speechOutput).listen(reprompt);
            this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

            this.response.renderTemplate(template);

            this.emit(':responseReady');
          }else{
            // REST request
            powerCTRL.handlePower(gatewayObject, uSpaceId, unit, unitId, constants.SL_API_POWER_ON, constants.DEFAULT_POWER_LEVEL, (function(error, resultObject){
              const speechOutput = 'turn on the ' + uSpaceName + ' ' + unitId + ' ' + unit;
              const reprompt = "Tell me, if you want to control other light.";

              const template = builder.setTitle(global.APP_NAME)
                                  .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                                  .setTextContent(makePlainText(speechOutput))
                                  .build();

              this.response.speak(speechOutput).listen(reprompt);
              this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

              this.response.renderTemplate(template);

              this.emit(':responseReady');
            }).bind(this));
          }

        }
      }else{
        const speechOutput = "First, you must discover your lights!";
        const reprompt = "Tell me, if you want to discover";

        const template = builder.setTitle(global.APP_NAME)
                            .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                            .setTextContent(makePlainText(speechOutput))
                            .build();

        this.response.speak(speechOutput).listen(reprompt);
        this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

        this.response.renderTemplate(template);

        this.emit(':responseReady');
      }
    }
  },// TurnOn
  'TurnOff': function () {
    console.log("TurnOff");

    // Echo Show Display
    const builder = new Alexa.templateBuilders.BodyTemplate1Builder();

    var key = constants.TABLE_USER_GATEWAY;
    const gatewayObject = this.attributes[key];

    if(gatewayObject === undefined){
      const speechOutput = "First, you must discover your gateway!";
      const reprompt = "Tell me, if you want to discover gateway.";

      const template = builder.setTitle(global.APP_NAME)
                          .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                          .setTextContent(makePlainText(speechOutput))
                          .build();

      this.response.speak(speechOutput).listen(reprompt);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

      this.response.renderTemplate(template);

      this.emit(':responseReady');
    }else{
      var key = constants.TABLE_USER_LIGHT_FLAG;
      const flag = this.attributes[key];

      if(flag){
        if (this.event.request.dialogState === 'STARTED') {
          var updatedIntent = this.event.request.intent;
          console.log(updatedIntent.slots);

          var updatedIntent = this.event.request.intent;
          var slots = updatedIntent.slots;


          if(slots.uSpaceName.hasOwnProperty("value")){
            const uSpaceName = slots.uSpaceName.value;

            var key = constants.TABLE_USER_UNIT_SPACE_PREFIX + uSpaceName;

            if(this.attributes[key]){
              if(slots.unit.hasOwnProperty("value")){

              }else{
                // default
                unit = "group";
                updatedIntent.slots.unit.value = unit;
              }

              this.emit(':delegate', updatedIntent);
            }else{
              const speechOutput = 'The space is not registered..';
              const reprompt = "Tell me, if you want to control other light.";

              const template = builder.setTitle(global.APP_NAME)
                                  .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                                  .setTextContent(makePlainText(speechOutput))
                                  .build();

              this.response.speak(speechOutput).listen(reprompt);
              this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

              this.response.renderTemplate(template);

              this.emit(':responseReady');
            }
          }else{
            this.emit(':delegate');
          }
        } else if (this.event.request.dialogState !== 'COMPLETED'){
          this.emit(':delegate');
        } else {
          var updatedIntent = this.event.request.intent;
          var slots = updatedIntent.slots;

          const unitId = updatedIntent.slots.unitId.value;
          var uSpaceName = "";
          if(slots.uSpaceName.hasOwnProperty("value")){
            unit = updatedIntent.slots.unit.value;
            uSpaceName = slots.uSpaceName.value;
          }else{
            unit = updatedIntent.slots.unit.resolutions.resolutionsPerAuthority[0].values[0].value.name;
          }

          const key = constants.TABLE_USER_UNIT_SPACE_PREFIX + uSpaceName;
          var uSpaceId = this.attributes[key];


          if(global.PROTOCOL == "MQTT"){
            // MQTT request
            var messageObject = {};
            const intent = "TurnOff";
            const userId = this.event.session.user.userId;

            var contentObject = {};
            contentObject.gatewayObject = gatewayObject;
            contentObject.uSpaceId = uSpaceId;
            contentObject.unit = unit;
            contentObject.unitId = unitId;

            messageObject.intent = intent;
            messageObject.userId = userId;
            messageObject.contentObject = contentObject;


            client.publish(requestTopic, JSON.stringify(messageObject));

            const speechOutput = 'turn off the ' + uSpaceName + ' ' + unitId + ' ' + unit;
            const reprompt = "Tell me, if you want to control other light.";

            const template = builder.setTitle(global.APP_NAME)
                                .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                                .setTextContent(makePlainText(speechOutput))
                                .build();

            this.response.speak(speechOutput).listen(reprompt);
            this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

            this.response.renderTemplate(template);


            this.emit(':responseReady');
          }else{
            // REST request
            powerCTRL.handlePower(gatewayObject, uSpaceId, unit, unitId, constants.SL_API_POWER_OFF, constants.DEFAULT_POWER_LEVEL, (function(error, resultObject){
              const speechOutput = 'turn off the ' + uSpaceName + ' ' + unitId + ' ' + unit;
              const reprompt = "Tell me, if you want to control other light.";

              const template = builder.setTitle(global.APP_NAME)
                                  .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                                  .setTextContent(makePlainText(speechOutput))
                                  .build();

              this.response.speak(speechOutput).listen(reprompt);
              this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

              this.response.renderTemplate(template);

              this.emit(':responseReady');
            }).bind(this));
          }

        }
      }else{
        const speechOutput = "First, you must discover your lights!";
        const reprompt = "Tell me, if you want to discover light.";

        const template = builder.setTitle(global.APP_NAME)
                            .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                            .setTextContent(makePlainText(speechOutput))
                            .build();

        this.response.speak(speechOutput).listen(reprompt);
        this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

        this.response.renderTemplate(template);


        this.emit(':responseReady');
      }
    }
  },// TurnOff
  'AdjustPowerLevel': function () {
    console.log("AdjustPowerLevel");

    // Echo Show Display
    const builder = new Alexa.templateBuilders.BodyTemplate1Builder();

    var key = constants.TABLE_USER_GATEWAY;
    const gatewayObject = this.attributes[key];

    if(gatewayObject === undefined){
      const speechOutput = "First, you must discover your gateway!";
      const reprompt = "Tell me, if you want to discover gateway.";

      const template = builder.setTitle(global.APP_NAME)
                          .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                          .setTextContent(makePlainText(speechOutput))
                          .build();

      this.response.speak(speechOutput).listen(reprompt);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

      this.response.renderTemplate(template);

      this.emit(':responseReady');
    }else{

      var key = constants.TABLE_USER_LIGHT_FLAG;
      const flag = this.attributes[key];

      if(flag){
        if (this.event.request.dialogState === 'STARTED') {
          var updatedIntent = this.event.request.intent;
          var slots = updatedIntent.slots;


          if(slots.uSpaceName.hasOwnProperty("value")){
            const uSpaceName = slots.uSpaceName.value;

            var key = constants.TABLE_USER_UNIT_SPACE_PREFIX + uSpaceName;

            if(this.attributes[key]){
              if(slots.unit.hasOwnProperty("value")){

              }else{
                // default
                unit = "group";
                updatedIntent.slots.unit.value = unit;
              }

              this.emit(':delegate', updatedIntent);
            }else{
              const speechOutput = 'The space is not registered..';
              const reprompt = "Tell me, if you want to control your light.";

              const template = builder.setTitle(global.APP_NAME)
                                  .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                                  .setTextContent(makePlainText(speechOutput))
                                  .build();

              this.response.speak(speechOutput).listen(reprompt);
              this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

              this.response.renderTemplate(template);

              this.emit(':responseReady');
            }
          }else{
            this.emit(':delegate');
          }
        } else if (this.event.request.dialogState !== 'COMPLETED'){
          this.emit(':delegate');
        } else {
          var updatedIntent = this.event.request.intent;
          var slots = updatedIntent.slots;

          console.log(updatedIntent.slots);

          const unitId = updatedIntent.slots.unitId.value;
          var uSpaceName = "";
          if(slots.uSpaceName.hasOwnProperty("value")){
            unit = updatedIntent.slots.unit.value;
            uSpaceName = slots.uSpaceName.value;
          }else{
            unit = updatedIntent.slots.unit.resolutions.resolutionsPerAuthority[0].values[0].value.name;
          }

          const key = constants.TABLE_USER_UNIT_SPACE_PREFIX + uSpaceName;
          var uSpaceId = this.attributes[key];
          const command = updatedIntent.slots.command.resolutions.resolutionsPerAuthority[0].values[0].value.name;


          if(global.PROTOCOL == "MQTT"){
            // MQTT request
            var messageObject = {};
            const intent = "AdjustPowerLevel";
            const userId = this.event.session.user.userId;

            var contentObject = {};
            contentObject.gatewayObject = gatewayObject;
            contentObject.uSpaceId = uSpaceId;
            contentObject.unit = unit;
            contentObject.unitId = unitId;
            contentObject.command = command;

            messageObject.intent = intent;
            messageObject.userId = userId;
            messageObject.contentObject = contentObject;


            client.publish(requestTopic, JSON.stringify(messageObject));

            const speechOutput = command + ', the ' + uSpaceName + ' ' + unitId + ' ' + unit + ' power level';
            const reprompt = "Tell me, if you want to control your light.";

            const template = builder.setTitle(global.APP_NAME)
                                .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                                .setTextContent(makePlainText(speechOutput))
                                .build();

            this.response.speak(speechOutput).listen(reprompt);
            this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

            this.response.renderTemplate(template);

            this.emit(':responseReady');
          }else{
            // REST request
            powerCTRL.adjustPowerLevel(gatewayObject, unit, unitId, command, (function(error, resultObject){
              const powerLevel = resultObject.data.powerLevel;

              const speechOutput = command + ', set the ' + uSpaceName + ' ' + unitId + ' ' + unit + ' power level ' + powerLevel;
              const reprompt = 'Do you want to Change more?'

              const template = builder.setTitle(global.APP_NAME)
                                  .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                                  .setTextContent(makePlainText(speechOutput))
                                  .build();

              this.response.speak(speechOutput).listen(reprompt);
              this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

              this.response.renderTemplate(template);

              this.emit(':responseReady');
            }).bind(this));

          }

        }
      }else{
        const speechOutput = "First, you must discover your lights!";
        const reprompt = "Tell me, if you want to control your light.";

        const template = builder.setTitle(global.APP_NAME)
                            .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                            .setTextContent(makePlainText(speechOutput))
                            .build();

        this.response.speak(speechOutput).listen(reprompt);
        this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

        this.response.renderTemplate(template);

        this.emit(':responseReady');
      }
    }
  },// AdjustPowerLevel
  'SetPowerLevel': function () {
    console.log("SetPowerLevel");

    // Echo Show Display
    const builder = new Alexa.templateBuilders.BodyTemplate1Builder();

    var key = constants.TABLE_USER_GATEWAY;
    const gatewayObject = this.attributes[key];

    if(gatewayObject === undefined){
      const speechOutput = "First, you must discover your gateway!";
      const reprompt = "Tell me, if you want to discover gateway.";

      const template = builder.setTitle(global.APP_NAME)
                          .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                          .setTextContent(makePlainText(speechOutput))
                          .build();

      this.response.speak(speechOutput).listen(reprompt);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

      this.response.renderTemplate(template);

      this.emit(':responseReady');
    }else{

      var key = constants.TABLE_USER_LIGHT_FLAG;
      const flag = this.attributes[key];

      if(flag){
        if (this.event.request.dialogState === 'STARTED') {
          var updatedIntent = this.event.request.intent;
          var slots = updatedIntent.slots;


          if(slots.uSpaceName.hasOwnProperty("value")){
            const uSpaceName = slots.uSpaceName.value;

            var key = constants.TABLE_USER_UNIT_SPACE_PREFIX + uSpaceName;

            if(this.attributes[key]){
              if(slots.unit.hasOwnProperty("value")){

              }else{
                // default
                unit = "group";
                updatedIntent.slots.unit.value = unit;
              }

              this.emit(':delegate', updatedIntent);
            }else{
              const speechOutput = 'The space is not registered..';
              const reprompt = "Tell me, if you want to control your light.";

              const template = builder.setTitle(global.APP_NAME)
                                  .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                                  .setTextContent(makePlainText(speechOutput))
                                  .build();

              this.response.speak(speechOutput).listen(reprompt);
              this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

              this.response.renderTemplate(template);

              this.emit(':responseReady');
            }
          }else{
            this.emit(':delegate');
          }
        } else if (this.event.request.dialogState !== 'COMPLETED'){
          this.emit(':delegate');
        } else {
          var updatedIntent = this.event.request.intent;
          var slots = updatedIntent.slots;

          const unitId = updatedIntent.slots.unitId.value;
          const powerLevel = updatedIntent.slots.powerLevel.value;
          var uSpaceName = "";
          if(slots.uSpaceName.hasOwnProperty("value")){
            unit = updatedIntent.slots.unit.value;
            uSpaceName = slots.uSpaceName.value;
          }else{
            unit = updatedIntent.slots.unit.resolutions.resolutionsPerAuthority[0].values[0].value.name;
          }

          const key = constants.TABLE_USER_UNIT_SPACE_PREFIX + uSpaceName;
          var uSpaceId = this.attributes[key];


          if(global.PROTOCOL == "MQTT"){
            // MQTT request
            var messageObject = {};
            const intent = "SetPowerLevel";
            const userId = this.event.session.user.userId;

            var contentObject = {};
            contentObject.gatewayObject = gatewayObject;
            contentObject.uSpaceId = uSpaceId;
            contentObject.unit = unit;
            contentObject.unitId = unitId;
            contentObject.powerLevel = powerLevel;

            messageObject.intent = intent;
            messageObject.userId = userId;
            messageObject.contentObject = contentObject;


            client.publish(requestTopic, JSON.stringify(messageObject));

            const speechOutput = 'Set the ' + uSpaceName + ' ' + unitId + ' ' + unit + ' power level ' + powerLevel;
            const reprompt = "Tell me, if you want to control your light.";

            const template = builder.setTitle(global.APP_NAME)
                                .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                                .setTextContent(makePlainText(speechOutput))
                                .build();

            this.response.speak(speechOutput).listen(reprompt);
            this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

            this.response.renderTemplate(template);

            this.emit(':responseReady');
          }else{
            // REST request
            powerCTRL.handlePower(gatewayObject, uSpaceId, unit, unitId, constants.SL_API_POWER_ON, powerLevel, (function(error, resultObject){
              const speechOutput = 'set the ' + uSpaceName + ' ' + unitId + ' ' + unit + ' power level ' + powerLevel;
              const reprompt = "Tell me, if you want to control your light.";

              const template = builder.setTitle(global.APP_NAME)
                                  .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                                  .setTextContent(makePlainText(speechOutput))
                                  .build();

              this.response.speak(speechOutput).listen(reprompt);
              this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

              this.response.renderTemplate(template);

              this.emit(':responseReady');
            }).bind(this));

          }



        }
      }else{
        const speechOutput = "First, you must discover your lights!";
        const reprompt = "Tell me, if you want to discover light.";

        const template = builder.setTitle(global.APP_NAME)
                            .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                            .setTextContent(makePlainText(speechOutput))
                            .build();

        this.response.speak(speechOutput).listen(reprompt);
        this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

        this.response.renderTemplate(template);
        this.emit(':responseReady');
      }
    }
  },// SetPowerLevel
  'AdjustBrightness': function () {
    console.log("AdjustBrightness");

    // Echo Show Display
    const builder = new Alexa.templateBuilders.BodyTemplate1Builder();

    var key = constants.TABLE_USER_GATEWAY;
    const gatewayObject = this.attributes[key];

    if(gatewayObject === undefined){
      const speechOutput = "First, you must discover your gateway!";
      const reprompt = "Tell me, if you want to discover gateway.";

      const template = builder.setTitle(global.APP_NAME)
                          .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                          .setTextContent(makePlainText(speechOutput))
                          .build();

      this.response.speak(speechOutput).listen(reprompt);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

      this.response.renderTemplate(template);

      this.emit(':responseReady');
    }else{

      var key = constants.TABLE_USER_LIGHT_FLAG;
      const flag = this.attributes[key];

      if(flag){
        if (this.event.request.dialogState === 'STARTED') {
          var updatedIntent = this.event.request.intent;
          var slots = updatedIntent.slots;


          if(slots.uSpaceName.hasOwnProperty("value")){
            const uSpaceName = slots.uSpaceName.value;

            var key = constants.TABLE_USER_UNIT_SPACE_PREFIX + uSpaceName;

            if(this.attributes[key]){
              if(slots.unit.hasOwnProperty("value")){

              }else{
                // default
                unit = "group";
                updatedIntent.slots.unit.value = unit;
              }

              this.emit(':delegate', updatedIntent);
            }else{
              const speechOutput = 'The space is not registered..';
              const reprompt = "Tell me, if you want to control your light.";

              const template = builder.setTitle(global.APP_NAME)
                                  .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                                  .setTextContent(makePlainText(speechOutput))
                                  .build();

              this.response.speak(speechOutput).listen(reprompt);
              this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

              this.response.renderTemplate(template);

              this.emit(':responseReady');
            }
          }else{
            this.emit(':delegate');
          }
        } else if (this.event.request.dialogState !== 'COMPLETED'){
          this.emit(':delegate');
        } else {
          var updatedIntent = this.event.request.intent;
          var slots = updatedIntent.slots;

          var uSpaceName = "";
          const unitId = updatedIntent.slots.unitId.value;
          const command = updatedIntent.slots.command.resolutions.resolutionsPerAuthority[0].values[0].value.name;
          if(slots.uSpaceName.hasOwnProperty("value")){
            unit = updatedIntent.slots.unit.value;
            uSpaceName = slots.uSpaceName.value;
          }else{
            unit = updatedIntent.slots.unit.resolutions.resolutionsPerAuthority[0].values[0].value.name;
          }

          const key = constants.TABLE_USER_UNIT_SPACE_PREFIX + uSpaceName;
          var uSpaceId = this.attributes[key];

          if(global.PROTOCOL == "MQTT"){
            // MQTT request
            var messageObject = {};
            const intent = "AdjustBrightness";
            const userId = this.event.session.user.userId;

            var contentObject = {};
            contentObject.gatewayObject = gatewayObject;
            contentObject.uSpaceId = uSpaceId;
            contentObject.unit = unit;
            contentObject.unitId = unitId;
            contentObject.command = command;

            messageObject.intent = intent;
            messageObject.userId = userId;
            messageObject.contentObject = contentObject;


            client.publish(requestTopic, JSON.stringify(messageObject));

            const speechOutput = command + ', the ' + uSpaceName + ' ' + unitId + ' ' + unit + ' brightness';
            const reprompt = "Tell me, if you want to control your light.";

            const template = builder.setTitle(global.APP_NAME)
                                .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                                .setTextContent(makePlainText(speechOutput))
                                .build();

            this.response.speak(speechOutput).listen(reprompt);
            this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

            this.response.renderTemplate(template);

            this.emit(':responseReady');
          }else{
            // REST request
            brightnessCTRL.adjustBrightness(gatewayObject, unit, unitId, command, (function(error, resultObject){
              const brightness = resultObject.data.brightness;

              const speechOutput = command + ', set the ' + uSpaceName + ' ' + unitId + ' ' + unit + ' brightness ' + brightness;
              const reprompt = "Tell me, if you want to control your light.";

              const template = builder.setTitle(global.APP_NAME)
                                  .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                                  .setTextContent(makePlainText(speechOutput))
                                  .build();

              this.response.speak(speechOutput).listen(reprompt);
              this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

              this.response.renderTemplate(template);

              this.emit(':responseReady');
            }).bind(this));
          }

        }
      }else{
        const speechOutput = "First, you must discover your lights!";
        const reprompt = "Tell me, if you want to discover light.";

        const template = builder.setTitle(global.APP_NAME)
                            .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                            .setTextContent(makePlainText(speechOutput))
                            .build();

        this.response.speak(speechOutput).listen(reprompt);
        this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

        this.response.renderTemplate(template);

        this.emit(':responseReady');
      }
    }
  },// AdjustBrightness
  'SetBrightness': function () {
    console.log("SetBrightness");

    // Echo Show Display
    const builder = new Alexa.templateBuilders.BodyTemplate1Builder();

    var key = constants.TABLE_USER_GATEWAY;
    const gatewayObject = this.attributes[key];

    if(gatewayObject === undefined){
      const speechOutput = "First, you must discover your gateway!";
      const reprompt = "Tell me, if you want to discover gateway.";

      const template = builder.setTitle(global.APP_NAME)
                          .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                          .setTextContent(makePlainText(speechOutput))
                          .build();

      this.response.speak(speechOutput).listen(reprompt);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

      this.response.renderTemplate(template);

      this.emit(':responseReady');
    }else{

      var key = constants.TABLE_USER_LIGHT_FLAG;
      const flag = this.attributes[key];

      if(flag){
        if (this.event.request.dialogState === 'STARTED') {
          var updatedIntent = this.event.request.intent;
          var slots = updatedIntent.slots;


          if(slots.uSpaceName.hasOwnProperty("value")){
            const uSpaceName = slots.uSpaceName.value;

            var key = constants.TABLE_USER_UNIT_SPACE_PREFIX + uSpaceName;

            if(this.attributes[key]){
              if(slots.unit.hasOwnProperty("value")){

              }else{
                // default
                unit = "group";
                updatedIntent.slots.unit.value = unit;
              }

              this.emit(':delegate', updatedIntent);
            }else{
              const speechOutput = 'The space is not registered..';
              const reprompt = "Tell me, if you want to control other light.";

              const template = builder.setTitle(global.APP_NAME)
                                  .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                                  .setTextContent(makePlainText(speechOutput))
                                  .build();

              this.response.speak(speechOutput).listen(reprompt);
              this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

              this.response.renderTemplate(template);

              this.emit(':responseReady');
            }
          }else{
            this.emit(':delegate');
          }
        } else if (this.event.request.dialogState !== 'COMPLETED'){
          this.emit(':delegate');
        } else {
          var updatedIntent = this.event.request.intent;
          var slots = updatedIntent.slots;

          var uSpaceName = "";
          const unitId = updatedIntent.slots.unitId.value;
          const brightness = updatedIntent.slots.brightness.value;
          if(slots.uSpaceName.hasOwnProperty("value")){
            unit = updatedIntent.slots.unit.value;
            uSpaceName = slots.uSpaceName.value;
          }else{
            unit = updatedIntent.slots.unit.resolutions.resolutionsPerAuthority[0].values[0].value.name;
          }

          const key = constants.TABLE_USER_UNIT_SPACE_PREFIX + uSpaceName;
          var uSpaceId = this.attributes[key];


          if(global.PROTOCOL == "MQTT"){
            // MQTT request
            var messageObject = {};
            const intent = "SetBrightness";
            const userId = this.event.session.user.userId;

            var contentObject = {};
            contentObject.gatewayObject = gatewayObject;
            contentObject.uSpaceId = uSpaceId;
            contentObject.unit = unit;
            contentObject.unitId = unitId;
            contentObject.brightness = brightness;

            messageObject.intent = intent;
            messageObject.userId = userId;
            messageObject.contentObject = contentObject;


            client.publish(requestTopic, JSON.stringify(messageObject));

            const speechOutput = 'Set the ' + uSpaceName + ' ' + unitId + ' ' + unit + ' brightness';
            const reprompt = "Tell me, if you want to control other light.";

            const template = builder.setTitle(global.APP_NAME)
                                .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                                .setTextContent(makePlainText(speechOutput))
                                .build();

            this.response.speak(speechOutput).listen(reprompt);
            this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

            this.response.renderTemplate(template);

            this.emit(':responseReady');
          }else{
            // REST request
            brightnessCTRL.setBrightness(gatewayObject, uSpaceId, unit, unitId, brightness, (function(error, resultObject){
              const speechOutput = 'set the ' + uSpaceName + ' ' + unitId + ' ' + unit + ' brightness ' + brightness;
              const reprompt = "Tell me, if you want to control other light.";

              const template = builder.setTitle(global.APP_NAME)
                                  .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                                  .setTextContent(makePlainText(speechOutput))
                                  .build();

              this.response.speak(speechOutput).listen(reprompt);
              this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

              this.response.renderTemplate(template);

              this.emit(':responseReady');
            }).bind(this));
          }

        }
      }else{
        const speechOutput = "First, you must discover your lights!";
        const reprompt = "Tell me, if you want to control other light.";

        const template = builder.setTitle(global.APP_NAME)
                            .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                            .setTextContent(makePlainText(speechOutput))
                            .build();

        this.response.speak(speechOutput).listen(reprompt);
        this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

        this.response.renderTemplate(template);

        this.emit(':responseReady');
      }
    }
  },// SetBrightness
  'SetColor': function () {
    console.log("SetColor");

    // Echo Show Display
    const builder = new Alexa.templateBuilders.BodyTemplate1Builder();

    var key = constants.TABLE_USER_GATEWAY;
    const gatewayObject = this.attributes[key];

    if(gatewayObject === undefined){
      const speechOutput = "First, you must discover your gateway!";
      const reprompt = "Tell me, if you want to discover gateway.";

      const template = builder.setTitle(global.APP_NAME)
                          .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                          .setTextContent(makePlainText(speechOutput))
                          .build();

      this.response.speak(speechOutput).listen(reprompt);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

      this.response.renderTemplate(template);

      this.emit(':responseReady');
    }else{

      var key = constants.TABLE_USER_LIGHT_FLAG;
      const flag = this.attributes[key];

      if(flag){
        if (this.event.request.dialogState === 'STARTED') {
          var updatedIntent = this.event.request.intent;
          var slots = updatedIntent.slots;


          if(slots.uSpaceName.hasOwnProperty("value")){
            const uSpaceName = slots.uSpaceName.value;

            var key = constants.TABLE_USER_UNIT_SPACE_PREFIX + uSpaceName;

            if(this.attributes[key]){
              if(slots.unit.hasOwnProperty("value")){

              }else{
                // default
                unit = "group";
                updatedIntent.slots.unit.value = unit;
              }

              this.emit(':delegate', updatedIntent);
            }else{
              const speechOutput = 'The space is not registered..';
              const reprompt = "Tell me, if you want to control your light.";

              const template = builder.setTitle(global.APP_NAME)
                                  .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                                  .setTextContent(makePlainText(speechOutput))
                                  .build();

              this.response.speak(speechOutput).listen(reprompt);
              this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

              this.response.renderTemplate(template);

              this.emit(':responseReady');
            }
          }else{
            this.emit(':delegate');
          }
        } else if (this.event.request.dialogState !== 'COMPLETED'){
          this.emit(':delegate');
        } else {
          var updatedIntent = this.event.request.intent;
          var slots = updatedIntent.slots;

          var uSpaceName = "";
          const unitId = updatedIntent.slots.unitId.value;
          const color = updatedIntent.slots.color.value;
          if(slots.uSpaceName.hasOwnProperty("value")){
            unit = updatedIntent.slots.unit.value;
            uSpaceName = slots.uSpaceName.value;
          }else{
            unit = updatedIntent.slots.unit.resolutions.resolutionsPerAuthority[0].values[0].value.name;
          }

          const key = constants.TABLE_USER_UNIT_SPACE_PREFIX + uSpaceName;
          var uSpaceId = this.attributes[key];


          if(global.PROTOCOL == "MQTT"){
            // MQTT request
            var messageObject = {};
            const intent = "SetColor";
            const userId = this.event.session.user.userId;

            var contentObject = {};
            contentObject.gatewayObject = gatewayObject;
            contentObject.uSpaceId = uSpaceId;
            contentObject.unit = unit;
            contentObject.unitId = unitId;
            contentObject.color = color;

            messageObject.intent = intent;
            messageObject.userId = userId;
            messageObject.contentObject = contentObject;


            client.publish(requestTopic, JSON.stringify(messageObject));

            const speechOutput = 'Set the ' + uSpaceName + ' ' + unitId + ' ' + unit + ' color' + color;
            const reprompt = "Tell me, if you want to control your light.";

            const template = builder.setTitle(global.APP_NAME)
                                .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                                .setTextContent(makePlainText(speechOutput))
                                .build();

            this.response.speak(speechOutput).listen(reprompt);
            this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

            this.response.renderTemplate(template);

            this.emit(':responseReady');
          }else{
            // REST request
            colorCTRL.handleColor(gatewayObject, uSpaceId, unit, unitId, color, (function(error, resultObject){
              const speechOutput = 'set the ' + uSpaceName + ' ' + unitId + ' ' + unit + ' color ' + color;
              const reprompt = "Tell me, if you want to control your light.";

              const template = builder.setTitle(global.APP_NAME)
                                  .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                                  .setTextContent(makePlainText(speechOutput))
                                  .build();

              this.response.speak(speechOutput).listen(reprompt);
              this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

              this.response.renderTemplate(template);

              this.emit(':responseReady');
            }).bind(this));
          }

        }
      }else{
        const speechOutput = "First, you must discover your lights!";
        const reprompt = "Tell me, if you want to discover light.";

        const template = builder.setTitle(global.APP_NAME)
                            .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                            .setTextContent(makePlainText(speechOutput))
                            .build();

        this.response.speak(speechOutput).listen(reprompt);
        this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

        this.response.renderTemplate(template);

        this.emit(':responseReady');
      }
    }
  },// SetColor
  'AdjustColorTemperature': function () {
    console.log("AdjustColorTemperature");

    // Echo Show Display
    const builder = new Alexa.templateBuilders.BodyTemplate1Builder();

    var key = constants.TABLE_USER_GATEWAY;
    const gatewayObject = this.attributes[key];

    if(gatewayObject === undefined){
      const speechOutput = "First, you must discover your gateway!";
      const reprompt = "Tell me, if you want to discover gateway.";

      const template = builder.setTitle(global.APP_NAME)
                          .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                          .setTextContent(makePlainText(speechOutput))
                          .build();

      this.response.speak(speechOutput).listen(reprompt);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

      this.response.renderTemplate(template);

      this.emit(':responseReady');
    }else{

      var key = constants.TABLE_USER_LIGHT_FLAG;
      const flag = this.attributes[key];

      if(flag){
        if (this.event.request.dialogState === 'STARTED') {
          var updatedIntent = this.event.request.intent;
          var slots = updatedIntent.slots;


          if(slots.uSpaceName.hasOwnProperty("value")){
            const uSpaceName = slots.uSpaceName.value;

            var key = constants.TABLE_USER_UNIT_SPACE_PREFIX + uSpaceName;

            if(this.attributes[key]){
              if(slots.unit.hasOwnProperty("value")){

              }else{
                // default
                unit = "group";
                updatedIntent.slots.unit.value = unit;
              }

              this.emit(':delegate', updatedIntent);
            }else{
              const speechOutput = 'The space is not registered..';
              const reprompt = "Tell me, if you want to control other light.";

              const template = builder.setTitle(global.APP_NAME)
                                  .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                                  .setTextContent(makePlainText(speechOutput))
                                  .build();

              this.response.speak(speechOutput).listen(reprompt);
              this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

              this.response.renderTemplate(template);

              this.emit(':responseReady');
            }
          }else{
            this.emit(':delegate');
          }
        } else if (this.event.request.dialogState !== 'COMPLETED'){
          this.emit(':delegate');
        } else {
          var updatedIntent = this.event.request.intent;
          var slots = updatedIntent.slots;

          var uSpaceName = "";
          const unitId = updatedIntent.slots.unitId.value;
          const command = updatedIntent.slots.command.resolutions.resolutionsPerAuthority[0].values[0].value.name;

          if(slots.uSpaceName.hasOwnProperty("value")){
            unit = updatedIntent.slots.unit.value;
            uSpaceName = slots.uSpaceName.value;
          }else{
            unit = updatedIntent.slots.unit.resolutions.resolutionsPerAuthority[0].values[0].value.name;
          }

          const key = constants.TABLE_USER_UNIT_SPACE_PREFIX + uSpaceName;
          var uSpaceId = this.attributes[key];


          if(global.PROTOCOL == "MQTT"){
            // MQTT request
            var messageObject = {};
            const intent = "AdjustColorTemperature";
            const userId = this.event.session.user.userId;

            var contentObject = {};
            contentObject.gatewayObject = gatewayObject;
            contentObject.uSpaceId = uSpaceId;
            contentObject.unit = unit;
            contentObject.unitId = unitId;
            contentObject.command = command;

            messageObject.intent = intent;
            messageObject.userId = userId;
            messageObject.contentObject = contentObject;


            client.publish(requestTopic, JSON.stringify(messageObject));

            const speechOutput = command + ', the ' + uSpaceName + ' ' + unitId + ' ' + unit + ' color temperature';
            const reprompt = "Tell me, if you want to control other light.";

            const template = builder.setTitle(global.APP_NAME)
                                .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                                .setTextContent(makePlainText(speechOutput))
                                .build();

            this.response.speak(speechOutput).listen(reprompt);
            this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

            this.response.renderTemplate(template);

            this.emit(':responseReady');
          }else{
            // REST request
            colorTempCTRL.adjustColorTemperature(gatewayObject, unit, unitId, command, (function(error, resultObject){
              const colorTemperature = resultObject.data.colorTemperature;

              const speechOutput = command + ', set the ' + uSpaceName + ' ' + unitId + ' ' + unit + ' color temperature ' + colorTemperature;
              const reprompt = "Tell me, if you want to control other light.";

              const template = builder.setTitle(global.APP_NAME)
                                  .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                                  .setTextContent(makePlainText(speechOutput))
                                  .build();

              this.response.speak(speechOutput).listen(reprompt);
              this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

              this.response.renderTemplate(template);

              this.emit(':responseReady');
            }).bind(this));
          }

        }
      }else{
        const speechOutput = "First, you must discover your lights!";
        const reprompt = "Tell me, if you want to discover light.";

        const template = builder.setTitle(global.APP_NAME)
                            .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                            .setTextContent(makePlainText(speechOutput))
                            .build();

        this.response.speak(speechOutput).listen(reprompt);
        this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

        this.response.renderTemplate(template);

        this.emit(':responseReady');
      }
    }
  },// AdjustColorTemperature
  'SetColorTemperature': function () {
    console.log("SetColorTemperature");

    // Echo Show Display
    const builder = new Alexa.templateBuilders.BodyTemplate1Builder();

    var key = constants.TABLE_USER_GATEWAY;
    const gatewayObject = this.attributes[key];

    if(gatewayObject === undefined){
      const speechOutput = "First, you must discover your gateway!";
      const reprompt = "Tell me, if you want to discover gateway.";

      const template = builder.setTitle(global.APP_NAME)
                          .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                          .setTextContent(makePlainText(speechOutput))
                          .build();

      this.response.speak(speechOutput).listen(reprompt);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

      this.response.renderTemplate(template);

      this.emit(':responseReady');
    }else{

      var key = constants.TABLE_USER_LIGHT_FLAG;
      const flag = this.attributes[key];

      if(flag){
        if (this.event.request.dialogState === 'STARTED') {
          var updatedIntent = this.event.request.intent;
          var slots = updatedIntent.slots;


          if(slots.uSpaceName.hasOwnProperty("value")){
            const uSpaceName = slots.uSpaceName.value;

            var key = constants.TABLE_USER_UNIT_SPACE_PREFIX + uSpaceName;

            if(this.attributes[key]){
              if(slots.unit.hasOwnProperty("value")){

              }else{
                // default
                unit = "group";
                updatedIntent.slots.unit.value = unit;
              }

              this.emit(':delegate', updatedIntent);
            }else{
              const speechOutput = 'The space is not registered..';
              const reprompt = "Tell me, if you want to control your light.";

              const template = builder.setTitle(global.APP_NAME)
                                  .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                                  .setTextContent(makePlainText(speechOutput))
                                  .build();

              this.response.speak(speechOutput).listen(reprompt);
              this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

              this.response.renderTemplate(template);

              this.emit(':responseReady');
            }
          }else{
            this.emit(':delegate');
          }
        } else if (this.event.request.dialogState !== 'COMPLETED'){
          this.emit(':delegate');
        } else {
          var updatedIntent = this.event.request.intent;
          var slots = updatedIntent.slots;

          var uSpaceName = "";
          const unitId = updatedIntent.slots.unitId.value;
          const colorTemperature = updatedIntent.slots.colorTemperature.value;

          if(slots.uSpaceName.hasOwnProperty("value")){
            unit = updatedIntent.slots.unit.value;
            uSpaceName = slots.uSpaceName.value;
          }else{
            unit = updatedIntent.slots.unit.resolutions.resolutionsPerAuthority[0].values[0].value.name;
          }

          const key = constants.TABLE_USER_UNIT_SPACE_PREFIX + uSpaceName;
          var uSpaceId = this.attributes[key];


          if(global.PROTOCOL == "MQTT"){
            // MQTT request
            var messageObject = {};
            const intent = "SetColorTemperature";
            const userId = this.event.session.user.userId;

            var contentObject = {};
            contentObject.gatewayObject = gatewayObject;
            contentObject.uSpaceId = uSpaceId;
            contentObject.unit = unit;
            contentObject.unitId = unitId;
            contentObject.colorTemperature = colorTemperature;

            messageObject.intent = intent;
            messageObject.userId = userId;
            messageObject.contentObject = contentObject;


            client.publish(requestTopic, JSON.stringify(messageObject));

            const speechOutput = 'Set the ' + uSpaceName + ' ' + unitId + ' ' + unit + ' color temperature ' + colorTemperature;
            const reprompt = "Tell me, if you want to control your light.";

            const template = builder.setTitle(global.APP_NAME)
                                .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                                .setTextContent(makePlainText(speechOutput))
                                .build();

            this.response.speak(speechOutput).listen(reprompt);
            this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

            this.response.renderTemplate(template);

            this.emit(':responseReady');
          }else{
            // REST request
            colorTempCTRL.setColorTemperature(gatewayObject, uSpaceId, unit, unitId, colorTemperature, (function(error, resultObject){
              const speechOutput = 'set the ' + uSpaceName + ' ' + unitId + ' ' + unit + ' color temperature ' + colorTemperature;
              const reprompt = "Tell me, if you want to control your light.";

              const template = builder.setTitle(global.APP_NAME)
                                  .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                                  .setTextContent(makePlainText(speechOutput))
                                  .build();

              this.response.speak(speechOutput).listen(reprompt);
              this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

              this.response.renderTemplate(template);

              this.emit(':responseReady');
            }).bind(this));
          }

        }
      }else{
        const speechOutput = "First, you must discover your lights!";
        const reprompt = "Tell me, if you want to discover light.";

        const template = builder.setTitle(global.APP_NAME)
                            .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                            .setTextContent(makePlainText(speechOutput))
                            .build();

        this.response.speak(speechOutput).listen(reprompt);
        this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

        this.response.renderTemplate(template);

        this.emit(':responseReady');
      }
    }
  }// SetColorTemperature
};// LightPropertyHandler
