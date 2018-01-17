
module.exports = {
  'LaunchRequest': function () {
    console.log("LaunchRequest");

    const speechOutput = 'Hi, there, This is ' + global.APP_NAME + ' skill app!';
    const reprompt = 'Ask me.';

    this.response.speak(speechOutput).listen(reprompt);
    this.emit(':responseReady');
  },// LaunchRequest
  'SessionEndedRequest': function () {
    console.log('SessionEndedRequest');

    const speechOutput = 'See ya!'

    this.response.speak(speechOutput);
  }// SessionEndedRequest
}// sessionHandlers
