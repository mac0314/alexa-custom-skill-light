
module.exports = {
  'AMAZON.HelpIntent': function () {
    console.log("HelpIntent");

    const speechOutput = 'This is alexa custom skill for ' + global.APP_NAME + '. You can order for me to discover, light on, light off, set color, adjust power level, adjust brightness, adjust color temperature';
    const reprompt = "Can I help you with anything else?"

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
