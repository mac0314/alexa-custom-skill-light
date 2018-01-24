
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
  'DiscoverGroups': function () {
    console.log("DiscoverGroups");

    var key = constants.TABLE_USER_GATEWAY;
    const gatewayObject = this.attributes[key];

    if(gatewayObject === undefined){
      const speechOutput = "First, you must discover your gateway!";
      this.response.speak(speechOutput);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

      this.emit(':responseReady');
    }else{
      groupCTRL.discoverGroups(gatewayObject, (function(error, resultObject){
        this.response.speak('Discover groups!');

        key = constants.TABLE_USER_GROUP_LIST;
        var value = resultObject.data.groupList;

        this.attributes[key] = value;

        this.emit(':saveState', true);
      }).bind(this));
    }
  },// DiscoverGroups
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

    this.response.speak('Add light to group!');
    this.emit(':responseReady');
  },// AddLightToGroup
  'LoadLightFromGroup': function () {
    console.log("LoadLightFromGroup");

    this.response.speak('Load light from group!');
    this.emit(':responseReady');
  },// LoadLightFromGroup
  'RemoveLightFromGroup': function () {
    console.log("RemoveLightFromGroup");

    this.response.speak('Remove light from group!');
    this.emit(':responseReady');
  }// RemoveLightFromGroup
};// GroupHandler
