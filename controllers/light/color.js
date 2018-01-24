
const colorConverter = require("color-convert");
const request = require("request");

const constants = require('../../lib/constants');


exports.handleColor = function(unit, unitId, color, callback){
  console.log("handleColorControl");

  var resultObject = {};

  // Request query
  const gatewayUrl = global.BASE_URL + "/" + unit + "/" + unitId + "/light";

  const onoff = constants.SL_API_POWER_ON;
  const level = constants.DEFAULT_POWER_LEVEL;

  var body = {};
  body.onoff = onoff;
  body.level = level;


  // color
  try {
    const colorHSL = colorConverter.keyword.hsl(color);

    console.log("colorHSL : ", colorHSL);

    body.hue = colorHSL[0];
    body.saturation = colorHSL[1];
    body.brightness = colorHSL[2];

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
      resultObject.message = "Success";

      callback(null, resultObject);
    });

  } catch(error){
    console.log("Error", error);

    resultObject.code = constants.SL_API_FAILURE_CODE;
    resultObject.message = "Failure";

    callback(true, resultObject);
  }
}// handleColorControl
