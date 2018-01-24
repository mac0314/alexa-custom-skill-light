
/***********
 modules
********* */
const config = require("config.json")("./config/config.json");

const unitSpaceCTRL = require('../controllers/unit_space/index');

const constants = require('../lib/constants');


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

      unitSpaceCTRL.createUnitSpace(gatewayObject, uSpaceName, (function(error, resultObject){
        var key = constants.TABLE_USER_UNIT_SPACE_PREFIX + uSpaceName;
        var value = resultObject.data.uSpaceId;



        const speechOutput = 'Create unit space ' + uSpaceName + "!";

        this.response.speak(speechOutput);

        this.attributes[key] = value;

        this.emit(':saveState', true);
      }).bind(this));
    }
  },// CreateUnitSpace
  'DiscoverUnitSpaces': function () {
    console.log("DiscoverUnitSpaces");

    var key = constants.TABLE_USER_GATEWAY;
    const gatewayObject = this.attributes[key];

    if(gatewayObject === undefined){
      const speechOutput = "First, you must discover your gateway!";
      this.response.speak(speechOutput);
      this.response.cardRenderer(global.APP_NAME, speechOutput, constants.BACKGROUND_IMAGE);

      this.emit(':responseReady');
    }else{
      unitSpaceCTRL.discoverUnitSpaces(gatewayObject, (function(error, resultObject){
        this.response.speak('Discover unitspaces!');

        var key = constants.TABLE_USER_UNIT_SPACE_LIST;
        var value = resultObject.data.uSpaceList;

        this.attributes[key] = value;

        this.emit(':saveState', true);
      }).bind(this));
    }
  },// DiscoverUnitSpaces
  'RemoveUnitSpace': function () {
    console.log("RemoveUnitSpace");

    this.response.speak('Remove unit space!');
    this.emit(':responseReady');
  },// RemoveUnitSpace
  'AddLightToUnitSpace': function () {
    console.log("AddLightToUnitSpace");

    this.response.speak('Add light to unit space!');
    this.emit(':responseReady');
  },// AddLightToUnitSpace
  'LoadLightFromUnitSpace': function () {
    console.log("LoadLightFromUnitSpace");

    this.response.speak('Load light from unit space!');
    this.emit(':responseReady');
  },// LoadLightFromUnitSpace
  'RemoveLightFromUnitSpace': function () {
    console.log("RemoveLightFromUnitSpace");

    this.response.speak('Remove light from unit space!');
    this.emit(':responseReady');
  }// RemoveLightFromUnitSpace
};// UnitSpaceHandler
