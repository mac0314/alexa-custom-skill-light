
/***********
 modules
********* */
const config = require("config.json")("./config/config.json");

const gatewayCTRL = require('../controllers/gateway/index');


const constants = require('../lib/constants');


module.exports = {
  'DiscoverGateway': function () {
    console.log("DiscoverGateway");

    gatewayCTRL.discoverGateway((function(error, resultObject){
      const response = resultObject.data.response;
      const gateway = resultObject.data.gateway;

      switch (response.type) {
        case constants.RESPONSE_SPEAK:
          this.response.speak(response.speechOutput);
          break;
        case constants.RESPONSE_SPEAK_AND_LISTEN:
          this.response.speak(response.speechOutput).listen(response.reprompt);
          break;
        default:
          break;
      }
      this.response.cardRenderer(global.APP_NAME, response.speechOutput, constants.BACKGROUND_IMAGE);

      var key = constants.TABLE_USER_GATEWAY_FLAG;

      if(gateway === null){
        this.attributes[key] = false;

        key = constants.TABLE_USER_LIGHTS_FLAG;
        this.attributes[key] = false;
        key = constants.TABLE_USER_GATEWAY;
        delete this.attributes[key];
        key = constants.TABLE_USER_LIGHTS;
        delete this.attributes[key];
        key = constants.TABLE_USER_GROUP_LIST;
        delete this.attributes[key];

      }else{
        this.attributes[key] = true;

        key = constants.TABLE_USER_GATEWAY;
        this.attributes[key] = gateway;
      }

      this.emit(':saveState', true);
    }).bind(this));
  }// DiscoverGateway
};// GatewayHandler
