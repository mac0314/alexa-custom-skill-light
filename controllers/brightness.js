
const async = require("async");
const request = require("request");


const constants = require('../lib/constants');


exports.adjustBrightness = function(deviceId, command, callback){
  console.log("adjustBrightness");

  var resultObject = {};

  var brightness = 0;
  var preBrightness = 0;
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

        var dataObject = JSON.parse(body);

        preBrightness = dataObject.result_data.brightness;
        preOnOff = dataObject.result_data.onoff;
        prePowerLevel = dataObject.result_data.level;

        callback(null);
      });
    },
    function(callback){
      // TODO modify equation
      switch (code) {
        case constants.INCREASE_CODE:
          brightness = Math.floor(preBrightness * constants.INCREASE_RATE);

          break;
        case constants.DECREASE_CODE:
          brightness = Math.floor(preBrightness * constants.DECREASE_RATE);

          break;
        default:
          brightness = Math.floor(preBrightness * constants.DEFAULT_RATE);

          break;
      }

      const gatewayUrl = global.BASE_URL + "/device/" + deviceId + "/light";

      var body = {};
      body.onoff = preOnOff;
      body.level = prePowerLevel;

      // color
      body.brightness = brightness;

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
      brightness: brightness
    }

    resultObject.data = data;

    callback(null, resultObject);
  });
}// adjustColorTemperature

exports.setBrightness = function(deviceId, brightness, callback){
  console.log("setBrightness");

  var resultObject = {};

  // Request query
  const gatewayUrl = global.BASE_URL + "/device/" + deviceId + "/light";

  const onoff = constants.SL_API_POWER_ON;
  const level = constants.DEFAULT_POWER_LEVEL;

  var body = {};
  body.onoff = onoff;
  body.level = level;

  // brightness
  body.brightness = brightness;

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
}// setBrightness
