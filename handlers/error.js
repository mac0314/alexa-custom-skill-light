
/***********
 modules
********* */
const Alexa = require("alexa-sdk");

// utility methods for creating Image and TextField objects
const makePlainText = Alexa.utils.TextUtils.makePlainText;
const makeImage = Alexa.utils.ImageUtils.makeImage;


const config = require("config.json")("./config/config.json");


const constants = require('../lib/constants');

module.exports = {
  'Unhandled': function () {
    console.log("Unhandled");

    const speechOutput = 'What would you like to do?';
    const reprompt = 'Please say that again?';

    // Echo Show Display
    const builder = new Alexa.templateBuilders.BodyTemplate1Builder();

    const template = builder.setTitle(global.APP_NAME)
                        .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                        .setTextContent(makePlainText(speechOutput))
                        .build();

    this.response.speak(speechOutput).listen(reprompt);
    this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

    this.response.renderTemplate(template);

    this.emit(':responseReady');
  }// Unhandled
};// LightHandler
