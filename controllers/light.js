
const async = require("async");
const request = require("request");


const constants = require('../lib/constants');


exports.loadData = function(unit, unitId, callback){
  console.log("loadData");

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
    console.log(body.result_data);

    var dataObject = JSON.parse(body);

    callback(null, dataObject);
});
