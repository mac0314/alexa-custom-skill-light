
const async = require("async");
const request = require("request");

const constants = require('../lib/constants');


exports.adjustPowerLevel = function(deviceId, command, callback){
  console.log("adjustPowerLevel");

  var resultObject = {};

  var powerLevel = constants.DEFAULT_POWER_LEVEL;
  var preOnOff = constants.DEFAULT_POWER;
  var prePowerLevel = constants.DEFAULT_POWER_LEVEL;
  var code = 0;

  switch (command) {
    case constants.INCREASE_COMMAND:
      code = constants.INCREASE_CODE;
      break;
    case constants.DECREASE_COMMAND:
      code = constants.DECREASE_CODE;
      break;
    default:
      break;
  }

  async.waterfall([
    function(callback){
      // Request query
      const gatewayUrl = global.BASE_URL + "/device/" + deviceId + "/light";

      var data = {
        url: gatewayUrl,
        headers: {
          'content-type': 'application/json'
        }
      }

      // request gateway
      request.get(data, function(error, httpResponse, body){
        console.log(body);
        console.log(body.result_data);

        var dataObject = JSON.parse(body);

        preOnOff = dataObject.result_data.onoff;
        prePowerLevel = dataObject.result_data.level;

        callback(null);
      });
    },
    function(callback){
      // TODO modify equation
      switch (code) {
        case constants.INCREASE_CODE:
          powerLevel = Math.floor(prePowerLevel * constants.INCREASE_RATE);

          break;
        case constants.DECREASE_CODE:
          powerLevel = Math.floor(prePowerLevel * constants.DECREASE_RATE);

          break;
        default:
          powerLevel = Math.floor(prePowerLevel * constants.DEFAULT_RATE);

          break;
      }

      const gatewayUrl = global.BASE_URL + "/device/" + deviceId + "/light";

      var body = {};
      body.onoff = preOnOff;
      body.level = powerLevel;


      var data = {
        url: gatewayUrl,
        headers: {
          'content-type': 'application/json'
        },
        json: JSON.stringify(body)
      }

      // request gateway
      request.put(data, function(error, httpResponse, body){
        console.log(body);

        callback(null, true);
      });
    }
  ], function(error, result){
    resultObject.code = constants.SL_API_SUCCESS_CODE;
    resultObject.message = "success";

    var data = {
      powerLevel: powerLevel
    }

    resultObject.data = data;

    callback(null, resultObject);
  });
}// handlePower


exports.handlePower = function(deviceId, onoff, powerLevel, callback){
  console.log("handlePower");

  var resultObject = {};

  // make query
  const gatewayUrl = global.BASE_URL + "/device/" + deviceId + "/light";

  var body = {};
  body.onoff = onoff;
  body.level = powerLevel;

  var data = {
    url: gatewayUrl,
    headers: {
      'content-type': 'application/json'
    },
    json: JSON.stringify(body)
  }

  // request gateway
  request.put(data, function(error, httpResponse, body){
    console.log(body);

    resultObject.code = constants.SL_API_SUCCESS_CODE;
    resultObject.message = "success";

    callback(null, resultObject);
  });
}// handlePower
