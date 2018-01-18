
const Alexa = require("alexa-sdk");

// utility methods for creating Image and TextField objects
const makePlainText = Alexa.utils.TextUtils.makePlainText;
const makeImage = Alexa.utils.ImageUtils.makeImage;

const constants = require('../lib/constants');


module.exports = {
  'LaunchRequest': function () {
    console.log("LaunchRequest");

    const speechOutput = 'Hi, there, This is ' + global.APP_NAME + ' skill app!';
    const reprompt = 'What can I help you?'

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
  },// LaunchRequest
  'SessionEndedRequest': function () {
    console.log('SessionEndedRequest');

    const speechOutput = 'See ya!'

    this.response.speak(speechOutput);
  }// SessionEndedRequest
}// sessionHandlers
