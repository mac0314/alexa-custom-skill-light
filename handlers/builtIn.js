
module.exports = {
  'AMAZON.HelpIntent': function () {
    console.log("HelpIntent");

    const speechOutput = 'This is alexa custom skill for ' + global.APP_NAME;
    const reprompt = 'Say hello, to hear me speak.';

    this.response.speak(speechOutput).listen(reprompt);
    this.emit(':responseReady');
  },// AMAZON.HelpIntent
  'AMAZON.CancelIntent': function () {
    console.log("CancelIntent");

    this.response.speak('Goodbye!');
    this.emit(':responseReady');
  },// AMAZON.CancelIntent
  'AMAZON.StopIntent': function () {
    console.log("StopIntent");

    this.response.speak('See you later!');
    this.emit(':responseReady');
  }// AMAZON.StopIntent
}// builtInHandlers
