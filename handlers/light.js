
/***********
 modules
********* */
const config = require("config.json")("./config/config.json");


const lightCTRL = require('../controllers/light/index');


const constants = require('../lib/constants');


module.exports = {
  'CreateLight': function () {
    console.log("CreateLight");

    var key = constants.TABLE_USER_GATEWAY;
    const gatewayObject = this.attributes[key];

    if(gatewayObject === undefined){
      const speechOutput = "First, you must discover your gateway!";
      this.response.speak(speechOutput);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

      this.emit(':responseReady');
    }else{
      const lightId = this.event.request.intent.slots.lightId.value;

      lightCTRL.createLight(gatewayObject, lightId, (function(error, resultObject){
        const speechOutput = "Create Light!";

        this.response.speak(speechOutput);
        this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

        this.emit(':responseReady');
      }).bind(this));
    }
  },// CreateLight
  'LoadLight': function () {
    console.log("LoadLight");

    var key = constants.TABLE_USER_GATEWAY;
    const gatewayObject = this.attributes[key];

    if(gatewayObject === undefined){
      const speechOutput = "First, you must discover your gateway!";
      this.response.speak(speechOutput);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

      this.emit(':responseReady');
    }else{
      var key = constants.TABLE_USER_LIGHT_FLAG;
      const flag = this.attributes[key];

      if(flag){
        const lightId = this.event.request.intent.slots.lightId.value;

        lightCTRL.loadLight(gatewayObject, lightId, (function(error, resultObject){
          const speechOutput = "load Light! " + JSON.stringify(resultObject.data);

          this.response.speak(speechOutput);
          this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

          this.emit(':responseReady');
        }).bind(this));
      }else{
        const speechOutput = "First, you must discover your lights!";
        this.response.speak(speechOutput);
        this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

        this.emit(':responseReady');
      }
    }
  },// LoadLight
  'RemoveLight': function () {
    console.log("RemoveLight");

    var key = constants.TABLE_USER_GATEWAY;
    const gatewayObject = this.attributes[key];

    if(gatewayObject === undefined){
      const speechOutput = "First, you must discover your gateway!";
      this.response.speak(speechOutput);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

      this.emit(':responseReady');
    }else{
      var key = constants.TABLE_USER_LIGHT_FLAG;
      const flag = this.attributes[key];

      if(flag){
        const lightId = this.event.request.intent.slots.lightId.value;

        lightCTRL.removeLight(gatewayObject, lightId, (function(error, resultObject){
          const speechOutput = "remove Light!";
          this.response.speak(speechOutput);
          this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

          this.emit(':responseReady');
        }).bind(this));
      }else{
        const speechOutput = "First, you must discover your lights!";
        this.response.speak(speechOutput);
        this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

        this.emit(':responseReady');
      }
    }
  },// RemoveLight
  'LoadLightList': function () {
    console.log("LoadLightList");

    var key = constants.TABLE_USER_GATEWAY;
    const gatewayObject = this.attributes[key];

    if(gatewayObject === undefined){
      const speechOutput = "First, you must discover your gateway!";
      this.response.speak(speechOutput);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

      this.emit(':responseReady');
    }else{
      lightCTRL.loadLightList(gatewayObject, (function(error, resultObject){
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


        key = constants.TABLE_USER_LIGHT_FLAG;
        if(lightList.length === 0){
          this.attributes[key] = false;
        }else{
          this.attributes[key] = true;

          key = constants.TABLE_USER_LIGHT_LIST;
          this.attributes[key] = lightList;
        }

        this.emit(':saveState', true);
      }).bind(this));
    }
  }// LoadLightList
};// LightHandler
