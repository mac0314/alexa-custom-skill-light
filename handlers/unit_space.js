
/***********
 modules
********* */
const config = require("config.json")("./config/config.json");

const unitSpaceCTRL = require('../controllers/unit_space/index');

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
  'CreateUnitSpace': function () {
    console.log("CreateUnitSpace");

    var key = constants.TABLE_USER_GATEWAY;
    const gatewayObject = this.attributes[key];

    if(gatewayObject === undefined){
      const speechOutput = "First, you must discover your gateway!";
      this.response.speak(speechOutput);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

      this.emit(':responseReady');
    }else{
      const uSpaceName = this.event.request.intent.slots.uSpaceName.value;

      if(global.TEST == "MQTT"){
        // MQTT request
        var messageObject = {};
        const intent = "CreateUnitSpace";
        const userId = this.event.session.user.userId;

        var contentObject = {};
        contentObject.gatewayObject = gatewayObject;
        contentObject.uSpaceName = uSpaceName;

        messageObject.intent = intent;
        messageObject.userId = userId;
        messageObject.contentObject = contentObject;


        client.publish(requestTopic, JSON.stringify(messageObject));

        const speechOutput = 'Create unit space ' + uSpaceName;

        this.response.speak(speechOutput);
        this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

        this.emit(':responseReady');
      }else{
        // REST request
        unitSpaceCTRL.createUnitSpace(gatewayObject, uSpaceName, (function(error, resultObject){
          var key = constants.TABLE_USER_UNIT_SPACE_PREFIX + uSpaceName;
          var value = resultObject.data.uSpaceId;



          const speechOutput = 'Create unit space ' + uSpaceName + "!";

          this.response.speak(speechOutput);

          this.attributes[key] = value;

          this.emit(':saveState', true);
        }).bind(this));
      }


    }
  },// CreateUnitSpace
  'LoadUnitSpaceList': function () {
    console.log("LoadUnitSpaceList");

    var key = constants.TABLE_USER_GATEWAY;
    const gatewayObject = this.attributes[key];

    if(gatewayObject === undefined){
      const speechOutput = "First, you must discover your gateway!";
      this.response.speak(speechOutput);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

      this.emit(':responseReady');
    }else{

      if(global.TEST == "MQTT"){
        // MQTT request
        var messageObject = {};
        const intent = "LoadUnitSpaceList";
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

            this.response.speak('Load unitspaces!' + JSON.stringify(dataObject.uSpaceList));

            var key = constants.TABLE_USER_UNIT_SPACE_LIST;
            var value = resultObject.data.uSpaceList;

            this.attributes[key] = value;

            this.emit(':saveState', true);
          }
        }).bind(this));
      }else{
        // REST request
        unitSpaceCTRL.loadUnitSpaceList(gatewayObject, (function(error, resultObject){
          this.response.speak('Load unitspaces!' + JSON.stringify(resultObject.data.uSpaceList));

          var key = constants.TABLE_USER_UNIT_SPACE_LIST;
          var value = resultObject.data.uSpaceList;

          this.attributes[key] = value;

          this.emit(':saveState', true);
        }).bind(this));
      }

    }
  },// LoadUnitSpaceList
  'RemoveUnitSpace': function () {
    console.log("RemoveUnitSpace");

    var key = constants.TABLE_USER_GATEWAY;
    const gatewayObject = this.attributes[key];

    if(gatewayObject === undefined){
      const speechOutput = "First, you must discover your gateway!";
      this.response.speak(speechOutput);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

      this.emit(':responseReady');
    }else{
      const uSpaceName = this.event.request.intent.slots.uSpaceName.value;

      var key = constants.TABLE_USER_UNIT_SPACE_PREFIX + uSpaceName;

      var uSpaceId = this.attributes[key];


      if(global.TEST == "MQTT"){
        // MQTT request
        var messageObject = {};
        const intent = "RemoveUnitSpace";
        const userId = this.event.session.user.userId;

        var contentObject = {};
        contentObject.gatewayObject = gatewayObject;
        contentObject.uSpaceId = uSpaceId;

        messageObject.intent = intent;
        messageObject.userId = userId;
        messageObject.contentObject = contentObject;


        client.publish(requestTopic, JSON.stringify(messageObject));

        const speechOutput = 'Remove unit space, ' + uSpaceName;

        this.response.speak(speechOutput);
        this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

        this.emit(':responseReady');
      }else{
        // REST request
        unitSpaceCTRL.removeUnitSpace(gatewayObject, uSpaceId, (function(error, resultObject){

          var key = constants.TABLE_USER_UNIT_SPACE_LIST;
          var unitSpaceList = this.attributes[key];

          console.log(key, unitSpaceList);

          var key = constants.TABLE_USER_UNIT_SPACE_PREFIX + uSpaceName;
          var uSpaceId = this.attributes[key];

          console.log(key, uSpaceId);

          delete this.attributes[key];

          this.response.speak(`Remove unit space ${uSpaceId}!`);
          this.emit(':saveState', true);
        }).bind(this));
      }


    }
  },// RemoveUnitSpace
  'AddLightToUnitSpace': function () {
    console.log("AddLightToUnitSpace");

    this.response.speak('Add light to unit space!');
    this.emit(':responseReady');
  },// AddLightToUnitSpace
  'AddGroupToUnitSpace': function () {
    console.log("AddGroupToUnitSpace");

    this.response.speak('Add group to unit space!');
    this.emit(':responseReady');
  },// AddGroupToUnitSpace
  'LoadLightListFromUnitSpace': function () {
    console.log("LoadLightListFromUnitSpace");

    var key = constants.TABLE_USER_GATEWAY;
    const gatewayObject = this.attributes[key];

    if(gatewayObject === undefined){
      const speechOutput = "First, you must discover your gateway!";
      this.response.speak(speechOutput);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

      this.emit(':responseReady');
    }else{
      const uSpaceName = this.event.request.intent.slots.uSpaceName.value;

      var key = constants.TABLE_USER_UNIT_SPACE_PREFIX + uSpaceName;

      var uSpaceId = this.attributes[key];


      if(global.TEST == "MQTT"){
        // MQTT request
        var messageObject = {};
        const intent = "LoadLightListFromUnitSpace";
        const userId = this.event.session.user.userId;

        var contentObject = {};
        contentObject.gatewayObject = gatewayObject;
        contentObject.uSpaceId = uSpaceId;

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

            var deviceList = dataObject.deviceList;

            var listName = "";

            // temp data
            for(var i=0; i<deviceList.length; i++){
              listName += " Light " + deviceList[i].did;
            }

            this.response.speak(`Load light from unit space ${uSpaceName}! Light List : ${listName}`);
            this.emit(':responseReady');
          }
        }).bind(this));

      }else{
        // REST request
        unitSpaceCTRL.loadLightListFromUnitSpace(gatewayObject, uSpaceId, (function(error, resultObject){
          var deviceList = resultObject.data.deviceList;

          var listName = "";

          // temp data
          for(var i=0; i<deviceList.length; i++){
            listName += " Light " + deviceList[i].did;
          }

          this.response.speak(`Load light from unit space ${uSpaceName}! Light List : ${listName}`);
          this.emit(':responseReady');
        }).bind(this));
      }


    }
  },// LoadLightListFromUnitSpace
  'LoadGroupLightListFromUnitSpace': function () {
    console.log("LoadGroupLightListFromUnitSpace");

    var key = constants.TABLE_USER_GATEWAY;
    const gatewayObject = this.attributes[key];

    if(gatewayObject === undefined){
      const speechOutput = "First, you must discover your gateway!";
      this.response.speak(speechOutput);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

      this.emit(':responseReady');
    }else{
      const uSpaceName = this.event.request.intent.slots.uSpaceName.value;
      const groupId = this.event.request.intent.slots.groupId.value;

      var key = constants.TABLE_USER_UNIT_SPACE_PREFIX + uSpaceName;

      var uSpaceId = this.attributes[key];


      if(global.TEST == "MQTT"){
        // MQTT request
        var messageObject = {};
        const intent = "LoadGroupLightListFromUnitSpace";
        const userId = this.event.session.user.userId;

        var contentObject = {};
        contentObject.gatewayObject = gatewayObject;
        contentObject.uSpaceId = uSpaceId;
        contentObject.groupId = groupId;

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

            var deviceList = dataObject.deviceList;

            var listName = "";

            // temp data
            for(var i=0; i<deviceList.length; i++){
              listName += " Light " + deviceList[i].did;
            }

            this.response.speak(`Load light from unit space ${uSpaceId}! Light list : ${listName}`);
            this.emit(':responseReady');
          }
        }).bind(this));

      }else{
        // REST request
        unitSpaceCTRL.loadGroupLightListFromUnitSpace(gatewayObject, groupId, uSpaceId, (function(error, resultObject){
          var deviceList = resultObject.data.deviceList;

          var listName = "";

          // temp data
          for(var i=0; i<deviceList.length; i++){
            listName += " Light " + deviceList[i].did;
          }

          this.response.speak(`Load light from unit space ${uSpaceId}! Light list : ${listName}`);
          this.emit(':responseReady');
        }).bind(this));
      }

    }
  },// LoadGroupLightListFromUnitSpace
  'RemoveLightFromUnitSpace': function () {
    console.log("RemoveLightFromUnitSpace");

    var key = constants.TABLE_USER_GATEWAY;
    const gatewayObject = this.attributes[key];

    if(gatewayObject === undefined){
      const speechOutput = "First, you must discover your gateway!";
      this.response.speak(speechOutput);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

      this.emit(':responseReady');
    }else{
      const uSpaceName = this.event.request.intent.slots.uSpaceName.value;
      const lightId = this.event.request.intent.slots.lightId.value;

      var key = constants.TABLE_USER_UNIT_SPACE_PREFIX + uSpaceName;

      var uSpaceId = this.attributes[key];


      if(global.TEST == "MQTT"){
        // MQTT request
        var messageObject = {};
        const intent = "RemoveLightFromUnitSpace";
        const userId = this.event.session.user.userId;

        var contentObject = {};
        contentObject.gatewayObject = gatewayObject;
        contentObject.uSpaceId = uSpaceId;
        contentObject.lightId = lightId;

        messageObject.intent = intent;
        messageObject.userId = userId;
        messageObject.contentObject = contentObject;


        client.publish(requestTopic, JSON.stringify(messageObject));

        const speechOutput = 'Remove light ' + lightId + ' from unit space ' + uSpaceName;

        this.response.speak(speechOutput);
        this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

        this.emit(':responseReady');
      }else{
        // REST request
        unitSpaceCTRL.removeLightFromUnitSpace(lightId, uSpaceId, (function(error, resultObject){


          this.response.speak(`Remove light ${lightId} from unit space ${uSpaceId}!`);
          this.emit(':responseReady');
        }).bind(this));
      }


    }
  },// RemoveLightFromUnitSpace
  'RemoveGroupFromUnitSpace': function () {
    console.log("RemoveGroupFromUnitSpace");

    var key = constants.TABLE_USER_GATEWAY;
    const gatewayObject = this.attributes[key];

    if(gatewayObject === undefined){
      const speechOutput = "First, you must discover your gateway!";
      this.response.speak(speechOutput);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

      this.emit(':responseReady');
    }else{
      const uSpaceName = this.event.request.intent.slots.uSpaceName.value;
      const groupId = this.event.request.intent.slots.groupId.value;

      var key = constants.TABLE_USER_UNIT_SPACE_PREFIX + uSpaceName;

      var uSpaceId = this.attributes[key];

      if(global.TEST == "MQTT"){
        // MQTT request
        var messageObject = {};
        const intent = "RemoveGroupFromUnitSpace";
        const userId = this.event.session.user.userId;

        var contentObject = {};
        contentObject.gatewayObject = gatewayObject;
        contentObject.uSpaceId = uSpaceId;
        contentObject.groupId = groupId;

        messageObject.intent = intent;
        messageObject.userId = userId;
        messageObject.contentObject = contentObject;


        client.publish(requestTopic, JSON.stringify(messageObject));

        const speechOutput = 'Remove group from unit space ' + uSpaceName;

        this.response.speak(speechOutput);
        this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

        this.emit(':responseReady');
      }else{
        // REST request
        unitSpaceCTRL.removeGroupFromUnitSpace(gatewayObject, groupId, uSpaceId, (function(error, resultObject){


          this.response.speak(`Remove group from unit space ${uSpaceId}!`);
          this.emit(':responseReady');
        }).bind(this));
      }


    }
  }// RemoveGroupFromUnitSpace
};// UnitSpaceHandler
