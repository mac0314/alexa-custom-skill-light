
const Alexa = require("alexa-sdk");

// utility methods for creating Image and TextField objects
const makePlainText = Alexa.utils.TextUtils.makePlainText;
const makeImage = Alexa.utils.ImageUtils.makeImage;


const constants = require('../lib/constants');


module.exports = {
  'AMAZON.HelpIntent': function () {
    console.log("HelpIntent");

    const speechOutput = 'This is alexa custom skill for ' + global.APP_NAME + '. You can order for me to discover, light on, light off, set color, adjust power level, adjust brightness, adjust color temperature';
    const reprompt = "Can I help you with anything else?"


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
  },// AMAZON.HelpIntent
  'AMAZON.CancelIntent': function () {
    console.log("CancelIntent");
    const speechOutput = 'Cancel!';


    // Echo Show Display
    const builder = new Alexa.templateBuilders.BodyTemplate1Builder();

    const template = builder.setTitle(global.APP_NAME)
                        .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                        .setTextContent(makePlainText(speechOutput))
                        .build();

    this.response.speak(speechOutput);
    this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

    this.response.renderTemplate(template);


    this.response.speak(speechOutput);
    this.emit(':responseReady');
  },// AMAZON.CancelIntent
  'AMAZON.StopIntent': function () {
    console.log("StopIntent");

    const speechOutput = 'See you later!';


    // Echo Show Display
    const builder = new Alexa.templateBuilders.BodyTemplate1Builder();

    const template = builder.setTitle(global.APP_NAME)
                        .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                        .setTextContent(makePlainText(speechOutput))
                        .build();

    this.response.speak(speechOutput);
    this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

    this.response.renderTemplate(template);


    this.response.speak(speechOutput);
    this.emit(':responseReady');
  }// AMAZON.StopIntent
}// builtInHandlers
