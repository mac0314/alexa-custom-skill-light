
'use strict';

const Alexa = require("alexa-sdk");
const config = require("config.json")("./config/config.json");

exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context);

    alexa.appId = config.alexa.appId;

    alexa.registerHandlers(handlers);
    
    alexa.execute();
};

const handlers = {
    'LaunchRequest': function () {
      console.log("LaunchRequest");
        this.emit('SayHello');
    },
    'SayHello': function () {
        console.log("SayHello");
        const speechOutput = 'Hi, there, This is system light skill app!';
        const reprompt = 'Ask me.';

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = 'This is alexa custom skill for system light 2.0.';
        const reprompt = 'Say hello, to hear me speak.';

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak('Goodbye!');
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
      console.log("StopIntent");
        this.response.speak('See you later!');
        this.emit(':responseReady');
    },
    'lightPowerOn': function () {
      console.log("lightPowerOn");
      const speechOutput = 'Which device?';
      const reprompt = 'on';

      this.response.speak(speechOutput).listen(reprompt);
      this.emit(':responseReady');
    },
    'lightPowerOff': function () {
      console.log("lightPowerOff");
      const speechOutput = 'Which device?';
      const reprompt = 'off';

      this.response.speak(speechOutput).listen(reprompt);
      this.emit(':responseReady');
    }
};
