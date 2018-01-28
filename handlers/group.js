
/***********
 modules
********* */
const Alexa = require("alexa-sdk");

// utility methods for creating Image and TextField objects
const makePlainText = Alexa.utils.TextUtils.makePlainText;
const makeImage = Alexa.utils.ImageUtils.makeImage;


const config = require("config.json")("./config/config.json");

const groupCTRL = require('../controllers/group/index');

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
  'CreateGroup': function () {
    console.log("CreateGroup");

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

      this.response.renderTemplate(template);

      this.emit(':responseReady');
    }else{
      const groupId = this.event.request.intent.slots.groupId.value;


      if(global.PROTOCOL == "MQTT"){
        // MQTT request
        var messageObject = {};
        const intent = "CreateGroup";
        const userId = this.event.session.user.userId;

        var contentObject = {};
        contentObject.gatewayObject = gatewayObject;
        contentObject.groupId = groupId;

        messageObject.intent = intent;
        messageObject.userId = userId;
        messageObject.contentObject = contentObject;


        client.publish(requestTopic, JSON.stringify(messageObject));

        const speechOutput = 'Create group ' + groupId;
        const reprompt = "Tell me, if you want to control your light.";

        const template = builder.setTitle(global.APP_NAME)
                            .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                            .setTextContent(makePlainText(speechOutput))
                            .build();

        this.response.speak(speechOutput).listen(reprompt);
        this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

        this.response.renderTemplate(template);

        this.emit(':responseReady');
      }else{
        // REST request
        groupCTRL.createGroup(gatewayObject, groupId, (function(error, resultObject){
          var key = constants.TABLE_USER_GROUP_PREFIX + groupId;
          var value = resultObject.data.gdid;

          this.attributes[key] = value;

          const speechOutput = 'Create group ' + groupId + "!";
          const reprompt = "Tell me, if you want to control your light.";

          const template = builder.setTitle(global.APP_NAME)
                              .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                              .setTextContent(makePlainText(speechOutput))
                              .build();

          this.response.speak(speechOutput).listen(reprompt);
          this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

          this.response.renderTemplate(template);

          this.emit(':saveState', true);
        }).bind(this));
      }


    }
  },// CreateGroup
  'LoadGroupList': function () {
    console.log("LoadGroupList");

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

      this.response.renderTemplate(template);

      this.emit(':responseReady');
    }else{
      if(global.PROTOCOL == "MQTT"){
        // MQTT request
        var messageObject = {};
        const intent = "LoadGroupList";
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

          if(mqttTopic == topic){
            var dataObject = messageObject.contentObject.data;

            var groupList = dataObject.groupList;

            var listName = "";

            for(var i=0; i<groupList.length; i++){
              listName += ", Group " + groupList[i].gdid;
            }

            const speechOutput = "Load group list" + listName;
            const reprompt = "Tell me, if you want to control your light.";

            const template = builder.setTitle(global.APP_NAME)
                                .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                                .setTextContent(makePlainText(speechOutput))
                                .build();

            this.response.speak(speechOutput).listen(reprompt);
            this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

            this.response.renderTemplate(template);

            key = constants.TABLE_USER_GROUP_LIST;
            var value = groupList;

            this.attributes[key] = value;

            this.emit(':saveState', true);
          }
        }).bind(this));
      }else{
        // REST request
        groupCTRL.loadGroupList(gatewayObject, (function(error, resultObject){
          var dataObject = resultObject.data;

          var groupList = dataObject.groupList;

          var listName = "";

          for(var i=0; i<groupList.length; i++){
            listName += ", Group " + groupList[i].gdid;
          }

          const speechOutput = "Load group list" + listName;
          const reprompt = "Tell me, if you want to control your light.";

          const template = builder.setTitle(global.APP_NAME)
                              .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                              .setTextContent(makePlainText(speechOutput))
                              .build();

          this.response.speak(speechOutput).listen(reprompt);
          this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

          this.response.renderTemplate(template);

          key = constants.TABLE_USER_GROUP_LIST;
          var value = groupList;

          this.attributes[key] = value;

          this.emit(':saveState', true);
        }).bind(this));
      }
    }
  },// LoadGroupList
  'RemoveGroup': function () {
    console.log("RemoveGroup");

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

      this.response.renderTemplate(template);

      this.emit(':responseReady');
    }else{
      const groupId = this.event.request.intent.slots.groupId.value;


      if(global.PROTOCOL == "MQTT"){
        // MQTT request
        var messageObject = {};
        const intent = "RemoveGroup";
        const userId = this.event.session.user.userId;

        var contentObject = {};
        contentObject.gatewayObject = gatewayObject;
        contentObject.groupId = groupId;

        messageObject.intent = intent;
        messageObject.userId = userId;
        messageObject.contentObject = contentObject;


        client.publish(requestTopic, JSON.stringify(messageObject));

        const speechOutput = 'Remove the ' + uSpaceName + ' ' + unitId + ' ' + unit;
        const reprompt = "Tell me, if you want to control your light.";

        const template = builder.setTitle(global.APP_NAME)
                            .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                            .setTextContent(makePlainText(speechOutput))
                            .build();

        this.response.speak(speechOutput).listen(reprompt);
        this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

        this.response.renderTemplate(template);

        this.emit(':responseReady');
      }else{
        // REST request
        groupCTRL.removeGroup(gatewayObject, groupId, (function(error, resultObject){

          var key = constants.TABLE_USER_GROUP_LIST;
          var groupList = this.attributes[key];

          console.log(key, groupList);

          var key = constants.TABLE_USER_GROUP_PREFIX + groupId;
          const gdid = this.attributes[key];

          console.log(key, gdid);

          for(var i=0; i<groupList.length; i++){

            if(gdid == groupList[i].gdid){
              groupList.splice(i, 1);

              var key = constants.TABLE_USER_GROUP_PREFIX + groupId;
              this.attributes[key] = '';
            }
          }

          const speechOutput = "Remove group " + groupId;
          const reprompt = "Tell me, if you want to control your light.";

          const template = builder.setTitle(global.APP_NAME)
                              .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                              .setTextContent(makePlainText(speechOutput))
                              .build();

          this.response.speak(speechOutput).listen(reprompt);
          this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

          this.response.renderTemplate(template);


          var key = constants.TABLE_USER_GROUP_LIST;
          var groupList = this.attributes[key];

          delete this.attributes[key];

          this.emit(':saveState', true);
        }).bind(this));
      }
    }

  },// RemoveGroup
  'AddLightToGroup': function () {
    console.log("AddLightToGroup");

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

      this.response.renderTemplate(template);

      this.emit(':responseReady');
    }else{
      const slots = this.event.request.intent.slots;
      const groupId = slots.groupId.value;
      const lightId = slots.lightId.value;

      var deviceObject = {};

      var key = constants.TABLE_USER_LIGHT_LIST;

      var deviceList = this.attributes[key];

      for(var i=0; i<deviceList.length; i++){
        if(lightId == deviceList[i].did){
          deviceObject = deviceList[i];
        }
      }


      if(global.PROTOCOL == "MQTT"){
        // MQTT request
        var messageObject = {};
        const intent = "AddLightToGroup";
        const userId = this.event.session.user.userId;

        var contentObject = {};
        contentObject.gatewayObject = gatewayObject;
        contentObject.deviceObject = deviceObject;
        contentObject.groupId = groupId;

        messageObject.intent = intent;
        messageObject.userId = userId;
        messageObject.contentObject = contentObject;


        client.publish(requestTopic, JSON.stringify(messageObject));

        const speechOutput = 'Add light ' + lightId + ' to group ' + groupId;
        const reprompt = "Tell me, if you want to control your light.";

        const template = builder.setTitle(global.APP_NAME)
                            .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                            .setTextContent(makePlainText(speechOutput))
                            .build();

        this.response.speak(speechOutput).listen(reprompt);
        this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

        this.response.renderTemplate(template);

        this.emit(':responseReady');
      }else{
        // REST request
        groupCTRL.addLightToGroup(gatewayObject, deviceObject, groupId, (function(error, resultObject){

          const speechOutput = 'Add light ' + lightId + ' to group ' + groupId;
          const reprompt = "Tell me, if you want to control your light.";

          const template = builder.setTitle(global.APP_NAME)
                              .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                              .setTextContent(makePlainText(speechOutput))
                              .build();

          this.response.speak(speechOutput).listen(reprompt);
          this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

          this.response.renderTemplate(template);

          this.emit(':saveState', true);
        }).bind(this));
      }
    }
  },// AddLightToGroup
  'LoadLightListFromGroup': function () {
    console.log("LoadLightListFromGroup");

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

      this.response.renderTemplate(template);

      this.emit(':responseReady');
    }else{
      const slots = this.event.request.intent.slots;
      const groupId = slots.groupId.value;


      if(global.PROTOCOL == "MQTT"){
        // MQTT request
        var messageObject = {};
        const intent = "LoadLightListFromGroup";
        const userId = this.event.session.user.userId;

        var contentObject = {};
        contentObject.gatewayObject = gatewayObject;
        contentObject.groupId = groupId;

        messageObject.intent = intent;
        messageObject.userId = userId;
        messageObject.contentObject = contentObject;


        client.publish(requestTopic, JSON.stringify(messageObject));

        var mqttTopic = topicPrefix + intent;
        client.subscribe(mqttTopic);

        client.on('message', (function (topic, message) {
          var messageObject = JSON.parse(message);

          if(mqttTopic == topic){
            var dataObject = messageObject.contentObject.data;

            var deviceList = dataObject.deviceList;

            var listName = "";

            for(var i = 0; i < deviceList.length; i++){
              listName += " Light " + deviceList[i].did;
            }

            const speechOutput = "Load light from group " + groupId + "! " + "device list : " + listName;
            const reprompt = "Tell me, if you want to discover gateway.";

            const template = builder.setTitle(global.APP_NAME)
                                .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                                .setTextContent(makePlainText(speechOutput))
                                .build();

            this.response.speak(speechOutput).listen(reprompt);
            this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

            this.response.renderTemplate(template);

            this.emit(':responseReady');
          }
        }).bind(this));

      }else{
        // REST request
        groupCTRL.loadLightListFromGroup(gatewayObject, groupId, (function(error, resultObject){
          var deviceList = dataObject.deviceList;

          var listName = "";

          for(var i = 0; i<deviceList.length; i++){
            listName += " Light " + deviceList[i].did;
          }

          const speechOutput = "Load light from group " + groupId + "!" + "device list : " + listName;
          const reprompt = "Tell me, if you want to discover gateway.";

          const template = builder.setTitle(global.APP_NAME)
                              .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                              .setTextContent(makePlainText(speechOutput))
                              .build();

          this.response.speak(speechOutput).listen(reprompt);
          this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

          this.response.renderTemplate(template);

          this.emit(':responseReady');
        }).bind(this));
      }
    }
  },// LoadLightListFromGroup
  'RemoveLightFromGroup': function () {
    console.log("RemoveLightFromGroup");

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

      this.response.renderTemplate(template);

      this.emit(':responseReady');
    }else{
      const slots = this.event.request.intent.slots;
      const groupId = slots.groupId.value;
      const lightId = slots.lightId.value;

      var deviceObject = {};

      var key = constants.TABLE_USER_LIGHT_LIST;

      var deviceList = this.attributes[key];

      for(var i=0; i<deviceList.length; i++){
        if(lightId == deviceList[i].did){
          deviceObject = deviceList[i];
        }
      }

      if(global.PROTOCOL == "MQTT"){
        // MQTT request
        var messageObject = {};
        const intent = "RemoveLightFromGroup";
        const userId = this.event.session.user.userId;

        var contentObject = {};
        contentObject.gatewayObject = gatewayObject;
        contentObject.uSpaceId = uSpaceId;
        contentObject.unit = unit;
        contentObject.unitId = unitId;

        messageObject.intent = intent;
        messageObject.userId = userId;
        messageObject.contentObject = contentObject;


        client.publish(requestTopic, JSON.stringify(messageObject));

        const speechOutput = 'Remove light ' + lightId + ' to group ' + groupId;
        const reprompt = "Tell me, if you want to control your light.";

        const template = builder.setTitle(global.APP_NAME)
                            .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                            .setTextContent(makePlainText(speechOutput))
                            .build();

        this.response.speak(speechOutput).listen(reprompt);
        this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

        this.response.renderTemplate(template);

        this.emit(':responseReady');
      }else{
        // REST request
        groupCTRL.removeLightFromGroup(gatewayObject, deviceObject, groupId, (function(error, resultObject){

          const speechOutput = "Remove light " + lightId + " to group " + groupId + "!";
          const reprompt = "Tell me, if you want to control your light.";

          const template = builder.setTitle(global.APP_NAME)
                              .setBackgroundImage(makeImage(constants.BACKGROUND_IMAGE, constants.ECHO_SHOW_DISPLAY_WIDTH, constants.ECHO_SHOW_DISPLAY_HEIGHT))
                              .setTextContent(makePlainText(speechOutput))
                              .build();

          this.response.speak(speechOutput).listen(reprompt);
          this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

          this.response.renderTemplate(template);

          this.emit(':saveState', true);
        }).bind(this));
      }


    }
  }// RemoveLightFromGroup
};// GroupHandler
