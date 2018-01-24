
const async = require("async");
const request = require("request");

const constants = require('../../lib/constants');


exports.adjustPowerLevel = function(unit, unitId, command, callback){
  console.log("adjustPowerLevel");

  var resultObject = {};

  var powerLevel = constants.DEFAULT_POWER_LEVEL;
  var preOnOff = constants.DEFAULT_POWER;
  var prePowerLevel = constants.DEFAULT_POWER_LEVEL;
  var code = constants.DEFAULT_CODE;

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
      var gatewayUrl = global.BASE_URL + "/" + unit + "/" + unitId;
      switch (unit) {
        case constants.UNIT_LIGHT:
          gatewayUrl += "/light";
          break;
        case constants.UNIT_GROUP:
          gatewayUrl += "/dstatus";
          break;
        default:
      }

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

        switch (unit) {
          case constants.UNIT_LIGHT:
            preOnOff = dataObject.result_data.onoff;
            prePowerLevel = dataObject.result_data.level;

            break;
          case constants.UNIT_GROUP:
            preOnOff = dataObject.result_data.device_list[0].onoff;
            prePowerLevel = dataObject.result_data.device_list[0].level;

            break;
          default:
            break;
        }

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

      const gatewayUrl = global.BASE_URL + "/" + unit + "/" + unitId + "/light";

      var body = {};
      body.onoff = preOnOff;
      body.level = powerLevel;


      if(unit == constants.UNIT_GROUP){
        body.onlevel = constants.DEFAULT_POWER_LEVEL;
      }

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


exports.handlePower = function(unit, unitId, onoff, powerLevel, callback){
  console.log("handlePower");

  var resultObject = {};

  // make query
  const gatewayUrl = global.BASE_URL + "/" + unit + "/" + unitId + "/light";

  var body = {};
  body.onoff = onoff;
  body.level = powerLevel;

  if(unit == constants.UNIT_GROUP){
    body.onlevel = constants.DEFAULT_POWER_LEVEL;
  }

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
