
/***********
 modules
********* */
const Alexa = require("alexa-sdk");

// utility methods for creating Image and TextField objects
const makePlainText = Alexa.utils.TextUtils.makePlainText;
const makeImage = Alexa.utils.ImageUtils.makeImage;


const config = require("config.json")("./config/config.json");


const lightCTRL = require('../controllers/light/index');


const constants = require('../lib/constants');


var mqtt = require('mqtt');

var url = config.aws.amazonMQ.mqtt.url + ":" + config.aws.amazonMQ.mqtt.port;
var option = {
  username : config.aws.amazonMQ.user.name,
  password : config.aws.amazonMQ.user.password
}
var client  = mqtt.connect(url, option);

const requestTopic = constants.MQTT_REQUEST_TOPIC;
const topicPrefix = constants.MQTT_RESPONSE_TOPIC_PREFIX;



module.exports = {
  'CreateLight': function () {
    console.log("CreateLight");

    // Echo Show Display
    const builder = new Alexa.templateBuilders.BodyTemplate1Builder();

    var key = constants.TABLE_USER_GATEWAY;
    const gatewayObject = this.attributes[key];

    if(gatewayObject === undefined){
      const speechOutput = "First, you must discover your gateway!";
      const reprompt = "Tell me, if you want to discover gateway.";

      const template = builder.setTitle(global.APP_NAME)
                          .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                          .setTextContent(makePlainText(speechOutput))
                          .build();

      this.response.speak(speechOutput).listen(reprompt);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

      if(global.DISPLAY_MODE){
        this.response.renderTemplate(template);
      }

      this.emit(':responseReady');
    }else{
      const lightId = this.event.request.intent.slots.lightId.value;

      if(global.PROTOCOL == "MQTT"){
        // MQTT request
        var messageObject = {};
        const intent = "CreateLight";
        const userId = this.event.session.user.userId;

        var contentObject = {};
        contentObject.gatewayObject = gatewayObject;
        contentObject.lightId = lightId;

        messageObject.intent = intent;
        messageObject.userId = userId;
        messageObject.contentObject = contentObject;

        client.publish(requestTopic, JSON.stringify(messageObject));

        const speechOutput = 'Create Light!';
        const reprompt = "Tell me, if you want to control your light.";

        const template = builder.setTitle(global.APP_NAME)
                            .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                            .setTextContent(makePlainText(speechOutput))
                            .build();

        this.response.speak(speechOutput).listen(reprompt);
        this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

        if(global.DISPLAY_MODE){
          this.response.renderTemplate(template);
        }

        this.emit(':responseReady');
      }else{
        // REST request
        lightCTRL.createLight(gatewayObject, lightId, (function(error, resultObject){
          const speechOutput = "Create Light!";
          const reprompt = "Tell me, if you want to control your light.";

          const template = builder.setTitle(global.APP_NAME)
                              .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                              .setTextContent(makePlainText(speechOutput))
                              .build();

          this.response.speak(speechOutput).listen(reprompt);
          this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

          if(global.DISPLAY_MODE){
            this.response.renderTemplate(template);
          }

          this.emit(':responseReady');
        }).bind(this));
      }

    }
  },// CreateLight
  'LoadLight': function () {
    console.log("LoadLight");

    // Echo Show Display
    const builder = new Alexa.templateBuilders.BodyTemplate1Builder();

    var key = constants.TABLE_USER_GATEWAY;
    const gatewayObject = this.attributes[key];

    if(gatewayObject === undefined){
      const speechOutput = "First, you must discover your gateway!";
      const reprompt = "Tell me, if you want to discover gateway.";

      const template = builder.setTitle(global.APP_NAME)
                          .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                          .setTextContent(makePlainText(speechOutput))
                          .build();

      this.response.speak(speechOutput).listen(reprompt);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

      if(global.DISPLAY_MODE){
        this.response.renderTemplate(template);
      }

      this.emit(':responseReady');
    }else{
      var key = constants.TABLE_USER_LIGHT_FLAG;
      const flag = this.attributes[key];

      if(flag){
        const lightId = this.event.request.intent.slots.lightId.value;


        if(global.PROTOCOL == "MQTT"){
          // MQTT request
          var messageObject = {};
          const intent = "LoadLight";
          const userId = this.event.session.user.userId;

          var contentObject = {};
          contentObject.gatewayObject = gatewayObject;
          contentObject.lightId = lightId;

          messageObject.intent = intent;
          messageObject.userId = userId;
          messageObject.contentObject = contentObject;

          client.publish(requestTopic, JSON.stringify(messageObject));

          var mqttTopic = topicPrefix + intent;
          client.subscribe(mqttTopic);

          client.on('message', (function (topic, message) {
            var messageObject = JSON.parse(message);

            var messageIntent = messageObject.intent;
            if(mqttTopic == topic){
              var dataObject = messageObject.contentObject.data;

              const speechOutput = "Load Light! " + JSON.stringify(dataObject);
              const reprompt = "If you want to control the light, tell me.";

              const template = builder.setTitle(global.APP_NAME)
                                  .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                                  .setTextContent(makePlainText(speechOutput))
                                  .build();

              this.response.speak(speechOutput).listen(reprompt);
              this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

              if(global.DISPLAY_MODE){
                this.response.renderTemplate(template);
              }

              this.emit(':responseReady');
            }
          }).bind(this));
        }else{
          // REST request
          lightCTRL.loadLight(gatewayObject, lightId, (function(error, resultObject){
            const speechOutput = "Load Light! " + JSON.stringify(resultObject.data);
            const reprompt = "If you want to control the light, tell me.";

            const template = builder.setTitle(global.APP_NAME)
                                .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                                .setTextContent(makePlainText(speechOutput))
                                .build();

            this.response.speak(speechOutput).listen(reprompt);
            this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

            if(global.DISPLAY_MODE){
              this.response.renderTemplate(template);
            }

            this.emit(':responseReady');
          }).bind(this));
        }

      }else{
        const speechOutput = "First, you must discover your lights!";
        const reprompt = "If you want to discover your lights, tell me.";

        const template = builder.setTitle(global.APP_NAME)
                            .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                            .setTextContent(makePlainText(speechOutput))
                            .build();

        this.response.speak(speechOutput).listen(reprompt);
        this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

        if(global.DISPLAY_MODE){
          this.response.renderTemplate(template);
        }

        this.emit(':responseReady');
      }
    }
  },// LoadLight
  'RemoveLight': function () {
    console.log("RemoveLight");

    // Echo Show Display
    const builder = new Alexa.templateBuilders.BodyTemplate1Builder();

    var key = constants.TABLE_USER_GATEWAY;
    const gatewayObject = this.attributes[key];

    if(gatewayObject === undefined){
      const speechOutput = "First, you must discover your gateway!";
      const reprompt = "If you want to discover gateway, please tell me.";

      const template = builder.setTitle(global.APP_NAME)
                          .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                          .setTextContent(makePlainText(speechOutput))
                          .build();

      this.response.speak(speechOutput).listen(reprompt);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

      if(global.DISPLAY_MODE){
        this.response.renderTemplate(template);
      }

      this.emit(':responseReady');
    }else{
      var key = constants.TABLE_USER_LIGHT_FLAG;
      const flag = this.attributes[key];

      if(flag){
        const lightId = this.event.request.intent.slots.lightId.value;


        if(global.PROTOCOL == "MQTT"){
          // MQTT request
          var messageObject = {};
          const intent = "RemoveLight";
          const userId = this.event.session.user.userId;

          var contentObject = {};
          contentObject.gatewayObject = gatewayObject;
          contentObject.lightId = lightId;

          messageObject.intent = intent;
          messageObject.userId = userId;
          messageObject.contentObject = contentObject;

          client.publish(requestTopic, JSON.stringify(messageObject));

          const speechOutput = "Remove Light!";
          const reprompt = "If you want to control your light, please tell me.";

          const template = builder.setTitle(global.APP_NAME)
                              .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                              .setTextContent(makePlainText(speechOutput))
                              .build();

          this.response.speak(speechOutput).listen(reprompt);
          this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

          if(global.DISPLAY_MODE){
            this.response.renderTemplate(template);
          }

          this.emit(':responseReady');
        }else{
          // REST request
          lightCTRL.removeLight(gatewayObject, lightId, (function(error, resultObject){
            const speechOutput = "remove Light!";
            const reprompt = "If you want to control your light, please tell me.";

            const template = builder.setTitle(global.APP_NAME)
                                .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                                .setTextContent(makePlainText(speechOutput))
                                .build();

            this.response.speak(speechOutput).listen(reprompt);
            this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

            if(global.DISPLAY_MODE){
              this.response.renderTemplate(template);
            }

            this.emit(':responseReady');
          }).bind(this));
        }

      }else{
        const speechOutput = "First, you must discover your lights!";
        const reprompt = "If you want to discover your lights, tell me.";

        const template = builder.setTitle(global.APP_NAME)
                            .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                            .setTextContent(makePlainText(speechOutput))
                            .build();

        this.response.speak(speechOutput).listen(reprompt);
        this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

        if(global.DISPLAY_MODE){
          this.response.renderTemplate(template);
        }

        this.emit(':responseReady');
      }
    }
  },// RemoveLight
  'LoadLightList': function () {
    console.log("LoadLightList");

    // Echo Show Display
    const builder = new Alexa.templateBuilders.BodyTemplate1Builder();

    var key = constants.TABLE_USER_GATEWAY;
    const gatewayObject = this.attributes[key];

    if(gatewayObject === undefined){
      const speechOutput = "First, you must discover your gateway!";
      const reprompt = "If you want to discover gateway, please tell me.";

      const template = builder.setTitle(global.APP_NAME)
                          .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                          .setTextContent(makePlainText(speechOutput))
                          .build();

      this.response.speak(speechOutput).listen(reprompt);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

      if(global.DISPLAY_MODE){
        this.response.renderTemplate(template);
      }

      this.emit(':responseReady');
    }else{

      if(global.PROTOCOL == "MQTT"){
        // MQTT request
        var messageObject = {};
        const intent = "LoadLightList";
        const userId = this.event.session.user.userId;

        var contentObject = {};
        contentObject.gatewayObject = gatewayObject;

        messageObject.intent = intent;
        messageObject.userId = userId;
        messageObject.contentObject = contentObject;

        client.publish(requestTopic, JSON.stringify(messageObject));

        var mqttTopic = topicPrefix + intent;
        client.subscribe(mqttTopic);

        client.on('message', (function (topic, message) {
          var messageObject = JSON.parse(message);

          var messageIntent = messageObject.intent;
          if(mqttTopic == topic){
            var dataObject = messageObject.contentObject.data;

            const response = dataObject.response;
            const lightList = dataObject.lightList;

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
            this.response.cardRenderer(global.APP_NAME, response.speechOutput, constants.BACKGROUND_IMAGE);

            if(global.DISPLAY_MODE){
              this.response.renderTemplate(template);
            }

            key = constants.TABLE_USER_LIGHT_FLAG;
            if(lightList.length === 0){
              this.attributes[key] = false;
            }else{
              this.attributes[key] = true;

              key = constants.TABLE_USER_LIGHT_LIST;
              this.attributes[key] = lightList;
            }

            this.emit(':saveState', true);
          }
        }).bind(this));
      }else{
        // REST request
        lightCTRL.loadLightList(gatewayObject, (function(error, resultObject){
          const response = resultObject.data.response;
          const lightList = resultObject.data.lightList;

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
          this.response.cardRenderer(global.APP_NAME, response.speechOutput, constants.BACKGROUND_IMAGE);

          if(global.DISPLAY_MODE){
            this.response.renderTemplate(template);
          }

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

    }
  }// LoadLightList
};// LightHandler
