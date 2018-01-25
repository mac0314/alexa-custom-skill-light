
/***********
 modules
********* */
const config = require("config.json")("./config/config.json");

const groupCTRL = require('../controllers/group/index');

const constants = require('../lib/constants');


module.exports = {
  'CreateGroup': function () {
    console.log("CreateGroup");

    var key = constants.TABLE_USER_GATEWAY;
    const gatewayObject = this.attributes[key];

    if(gatewayObject === undefined){
      const speechOutput = "First, you must discover your gateway!";
      this.response.speak(speechOutput);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

      this.emit(':responseReady');
    }else{
      const groupId = this.event.request.intent.slots.groupId.value;

      groupCTRL.createGroup(gatewayObject, groupId, (function(error, resultObject){
        var key = constants.TABLE_USER_GROUP_PREFIX + groupId;
        var value = resultObject.data.gdid;

        this.attributes[key] = value;

        const speechOutput = 'Create group' + groupId + "!";

        this.response.speak(speechOutput);

        this.emit(':saveState', true);
      }).bind(this));
    }
  },// CreateGroup
  'LoadGroupList': function () {
    console.log("LoadGroupList");

    var key = constants.TABLE_USER_GATEWAY;
    const gatewayObject = this.attributes[key];

    if(gatewayObject === undefined){
      const speechOutput = "First, you must discover your gateway!";
      this.response.speak(speechOutput);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

      this.emit(':responseReady');
    }else{
      groupCTRL.loadGroupList(gatewayObject, (function(error, resultObject){
        this.response.speak('Load group list!' + JSON.stringify(resultObject.data.groupList));

        key = constants.TABLE_USER_GROUP_LIST;
        var value = resultObject.data.groupList;

        this.attributes[key] = value;

        this.emit(':saveState', true);
      }).bind(this));
    }
  },// LoadGroupList
  'RemoveGroup': function () {
    console.log("RemoveGroup");

    var key = constants.TABLE_USER_GATEWAY;
    const gatewayObject = this.attributes[key];

    if(gatewayObject === undefined){
      const speechOutput = "First, you must discover your gateway!";
      this.response.speak(speechOutput);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

      this.emit(':responseReady');
    }else{
      const groupId = this.event.request.intent.slots.groupId.value;

      groupCTRL.removeGroup(groupId, (function(error, resultObject){

        var key = constants.TABLE_USER_GROUP_LIST;
        var groupList = this.attributes[key];

        console.log(key, groupList);

        var key = constants.TABLE_USER_GROUP_PREFIX + groupId;
        const gdid = this.attributes[key];

        console.log(key, gdid);
/*
        for(var i=0; i<groupList.length; i++){

          if(gdid == groupList[i].gdid){
            groupList.splice(i, 1);

            var key = constants.TABLE_USER_GROUP_PREFIX + groupId;
            this.attributes[key] = '';
          }
        }


        var key = constants.TABLE_USER_GROUP_LIST;
        var groupList = this.attributes[key];
*/
        delete this.attributes[key];

        this.response.speak(`Remove group ${groupId}!`);
        this.emit(':saveState', true);
      }).bind(this));
    }

  },// RemoveGroup
  'AddLightToGroup': function () {
    console.log("AddLightToGroup");

    var key = constants.TABLE_USER_GATEWAY;
    const gatewayObject = this.attributes[key];

    if(gatewayObject === undefined){
      const speechOutput = "First, you must discover your gateway!";
      this.response.speak(speechOutput);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

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

      groupCTRL.addLightToGroup(gatewayObject, deviceObject, groupId, (function(error, resultObject){



        this.response.speak(`Add light to group ${groupId}!`);
        this.emit(':saveState', true);
      }).bind(this));
    }
  },// AddLightToGroup
  'LoadLightListFromGroup': function () {
    console.log("LoadLightListFromGroup");

    var key = constants.TABLE_USER_GATEWAY;
    const gatewayObject = this.attributes[key];

    if(gatewayObject === undefined){
      const speechOutput = "First, you must discover your gateway!";
      this.response.speak(speechOutput);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

      this.emit(':responseReady');
    }else{
      const slots = this.event.request.intent.slots;
      const groupId = slots.groupId.value;

      groupCTRL.loadLightListFromGroup(gatewayObject, groupId, (function(error, resultObject){
        var deviceList = JSON.stringify(resultObject.data.deviceList);

        this.response.speak(`Load light from group ${groupId}! deviceList : ${deviceList}`);
        this.emit(':responseReady');
      }).bind(this));
    }
  },// LoadLightListFromGroup
  'RemoveLightFromGroup': function () {
    console.log("RemoveLightFromGroup");

    var key = constants.TABLE_USER_GATEWAY;
    const gatewayObject = this.attributes[key];

    if(gatewayObject === undefined){
      const speechOutput = "First, you must discover your gateway!";
      this.response.speak(speechOutput);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

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

      groupCTRL.removeLightFromGroup(gatewayObject, deviceObject, groupId, (function(error, resultObject){



        this.response.speak(`Remove light to group ${groupId}!`);
        this.emit(':saveState', true);
      }).bind(this));
    }
  }// RemoveLightFromGroup
};// GroupHandler
