
const async = require("async");
const request = require("request");

const constants = require('../lib/constants');


exports.discover = function(gatewayId, callback){
  console.log("discover");

  var resultObject = {};


  const gatewayUrl = global.BASE_URL + "/device";

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

    var deviceList = dataObject.result_data.device_list;

    console.log("deviceList", deviceList);

    var deviceNameList = [];

    for(var i = 0; i < deviceList.length; i++){
      deviceNameList.push(deviceList[i].did);
    }

    var data = {
      deviceNameList: deviceNameList
    }

    resultObject.code = 0;
    resultObject.message = "Success";
    resultObject.data = data;

    callback(null, resultObject);
  });
}
