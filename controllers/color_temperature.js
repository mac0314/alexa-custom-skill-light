
const async = require("async");
const request = require("request");


const constants = require('../lib/constants');


exports.adjustColorTemperature = function(unit, unitId, command, callback){
  console.log("adjustColorTemperature");

  var resultObject = {};

  var colorTemperature = 0;
  var preColorTemperature = 0;
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
      var gatewayUrl = global.BASE_URL + "/" + unit + "/" + unitId;
      switch (unit) {
        case constants.UNIT_DEVICE:
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

        var dataObject = JSON.parse(body);

        switch (unit) {
          case constants.UNIT_DEVICE:
            preOnOff = dataObject.result_data.onoff;
            prePowerLevel = dataObject.result_data.level;
            preColorTemperature = dataObject.result_data.colorTemp;

            break;
          case constants.UNIT_GROUP:
            preOnOff = dataObject.result_data.device_list[0].onoff;
            prePowerLevel = dataObject.result_data.device_list[0].level;
            preColorTemperature = dataObject.result_data.device_list[0].colorTemp;

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
          colorTemperature = Math.floor(preColorTemperature * constants.INCREASE_RATE);

          break;
        case constants.DECREASE_CODE:
          colorTemperature = Math.floor(preColorTemperature * constants.DECREASE_RATE);

          break;
        default:
          colorTemperature = Math.floor(preColorTemperature * constants.DEFAULT_RATE);

          break;
      }

      const gatewayUrl = global.BASE_URL + "/" + unit + "/" + unitId + "/light";

      var body = {};
      body.onoff = preOnOff;
      body.level = prePowerLevel;

      // color
      body.colorTemp = colorTemperature;

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

      console.log("data", data);

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
      colorTemperature: colorTemperature
    }

    resultObject.data = data;

    callback(null, resultObject);
  });
}// adjustColorTemperature




exports.setColorTemperature = function(unit, unitId, colorTemperature, callback){
  console.log("setColorTemperature");

  var resultObject = {};

  // Request query
  const gatewayUrl = global.BASE_URL + "/" + unit + "/" + unitId + "/light";

  const onoff = SL_API_POWER_ON;
  const level = DEFAULT_POWER_LEVEL;

  const colorTemperatureInKelvin = colorTemperature;

  var body = {};
  body.onoff = onoff;
  body.level = level;

  // color
  body.colorTemp = colorTemperatureInKelvin;

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
}// setColorTemperature
