
const async = require("async");
const config = require("config.json")("./config/config.json");
const request = require("request");

const constants = require('../lib/constants');
const makeGatewayURL = require('../js/make_gateway_URL');

exports.discoverGateway = function(callback){
  console.log("discoverGateway");

  var resultObject = {};

  // TODO Add multicast request
  // TEMP data
  var responseDemo = require('../response/gateway/discovery.json');

  var gatewayObject = responseDemo.result_data;
  gatewayObject.ip = config.sl.gw.ip;
  gatewayObject.tcp_port = config.sl.gw.port;


  var response = {};

  if(gatewayObject === null){
    response.type = constants.RESPONSE_SPEAK;
    response.speechOutput = "Don't find the gateway...";
  }else{
    response.type = constants.RESPONSE_SPEAK_AND_LISTEN;
    response.speechOutput = "Find the gateway, " + gatewayObject.gid + "!";
    response.reprompt = 'What do you want to control the gateway?';
  }

  var data = {};

  data.gateway = gatewayObject;
  data.response = response;

  resultObject.code = constants.SL_API_SUCCESS_CODE;
  resultObject.message = "Success";
  resultObject.data = data;


  callback(null, resultObject);
};// discoverGateways


exports.discoverDevices = function(gatewayObject, callback){
  console.log("discoverDevices");

  var resultObject = {};

  var response = {};

  if(gatewayObject === null){
    response.type = constants.RESPONSE_SPEAK;
    response.speechOutput = "Don't find the gateway...";
  }else{
    response.type = constants.RESPONSE_SPEAK_AND_LISTEN;
    response.speechOutput = "Find the gateway, " + gatewayObject.gid + "!";
    response.reprompt = 'What do you want to control the gateway?';

  }

  const ip = gatewayObject.ip;
  const port = gatewayObject.tcp_port;
  const version = config.sl.gw.version;

  const gatewayURL = makeGatewayURL(ip, port, version);
  const requestURL = gatewayURL + "/device";

  var data = {
    url: requestURL,
    headers: {
      'content-type': 'application/json'
    }
  }

  // request gateway
  request.get(data, function(error, httpResponse, body){
    console.log(body);

    var dataObject = JSON.parse(body);

    var deviceList = dataObject.result_data.device_list;

    const deviceNum = deviceList.length;

    var response = {};

    if(deviceNum > 1){
      response.type = constants.RESPONSE_SPEAK_AND_LISTEN;
      response.speechOutput = "Find the devices";

      for(let i = 0; i < deviceList.length; i++){
        response.speechOutput += ", " + deviceList[i].did;
      }
      response.speechOutput += "!";

      response.reprompt = 'What do you want to control the devices?';
    }else if(deviceNum == 1){
      response.type = constants.RESPONSE_SPEAK_AND_LISTEN;
      response.speechOutput = "Find the device, " + deviceList[0].did + "!";
      response.reprompt = 'What do you want to control the device?';
    }else{
      response.type = constants.RESPONSE_SPEAK;
      response.speechOutput = "Don't find any device.";
    }


    var data = {};

    data.response = response;
    data.deviceList = deviceList;


    resultObject.code = 0;
    resultObject.message = "Success";
    resultObject.data = data;

    callback(null, resultObject);
  });
}
