
const constants = require('../lib/constants');


module.exports = {
  'LaunchRequest': function () {
    console.log("LaunchRequest");

    const speechOutput = 'Hi, there, This is ' + global.APP_NAME + ' skill app!';
    const reprompt = 'What can I help you?'


    this.response.speak(speechOutput).listen(reprompt);
    this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

    this.emit(':responseReady');
  },// LaunchRequest
  'SessionEndedRequest': function () {
    console.log('SessionEndedRequest');

    const speechOutput = 'See ya!'

    this.response.speak(speechOutput);
  }// SessionEndedRequest
}// sessionHandlers
