
/***********
 modules
********* */
const Alexa = require("alexa-sdk");

// utility methods for creating Image and TextField objects
const makePlainText = Alexa.utils.TextUtils.makePlainText;
const makeImage = Alexa.utils.ImageUtils.makeImage;

const config = require("config.json")("./config/config.json");

const gatewayCTRL = require('../controllers/gateway/index');


const constants = require('../lib/constants');


module.exports = {
  'DiscoverGateway': function () {
    console.log("DiscoverGateway");

    // Echo Show Display
    const builder = new Alexa.templateBuilders.BodyTemplate1Builder();

    gatewayCTRL.discoverGateway((function(error, resultObject){
      const response = resultObject.data.response;
      const gateway = resultObject.data.gateway;

      const speechOutput = response.speechOutput;
      const reprompt = response.reprompt;

      const template = builder.setTitle(global.APP_NAME)
                          .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                          .setTextContent(makePlainText(speechOutput))
                          .build();

      switch (response.type) {
        case constants.RESPONSE_SPEAK:
          this.response.speak(speechOutput);
          break;
        case constants.RESPONSE_SPEAK_AND_LISTEN:
          this.response.speak(speechOutput).listen(reprompt);
          break;
        default:
          break;
      }
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

      this.response.renderTemplate(template);

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
  }// DiscoverGateway
};// GatewayHandler
