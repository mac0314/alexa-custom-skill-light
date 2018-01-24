
const async = require("async");
const config = require("config.json")("./config/config.json");
const request = require("request");


const constants = require('../../lib/constants');
const makeGatewayURL = require('../../js/make_gateway_URL');


exports.createUnitSpace = function(gatewayObject, uSpaceName, callback){
  console.log("createUnitSpace");

  var resultObject = {};

  const ip = gatewayObject.ip;
  const port = gatewayObject.tcp_port;
  const version = config.sl.gw.version;

  const gatewayURL = makeGatewayURL(ip, port, version);
  const requestURL = gatewayURL + "/uspace";


  // TEMP data
  const uSpaceId = Math.floor(Math.random() * 10000);
  const uSpaceType = Math.floor(Math.random() * 10);
  const uSpaceMin = Math.floor(Math.random() * 10);
  const uSpaceMax = Math.floor(Math.random() * 100) + 10;
  const lightList = [];

  var body = {};
  body.uspace_id = uSpaceId;
  body.uspace_name = uSpaceName;
  body.uspace_type = uSpaceType;
  body.uspace_min = uSpaceMin;
  body.uspace_max = uSpaceMax;
  body.device_list = lightList;

  var data = {
    url: requestURL,
    headers: {
      'content-type': 'application/json'
    },
    json: JSON.stringify(body)
  }

  // request gateway
  request.post(data, function(error, httpResponse, body){
    console.log(body);

    resultObject.code = constants.SL_API_SUCCESS_CODE;
    resultObject.message = "success";

    var data = {
      uSpaceId : uSpaceId,
      uSpaceName : uSpaceName
    }

    resultObject.data = data;

    callback(null, resultObject);
  });
}// createUnitSpace


exports.discoverUnitSpaces = function(gatewayObject, callback){
  console.log("discoverUnitSpaces");

  var resultObject = {};

  const ip = gatewayObject.ip;
  const port = gatewayObject.tcp_port;
  const version = config.sl.gw.version;

  const gatewayURL = makeGatewayURL(ip, port, version);
  const requestURL = gatewayURL + "/uspace";

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

    var uSpaceList = dataObject.result_data.uspace_list;

    resultObject.code = constants.SL_API_SUCCESS_CODE;
    resultObject.message = "success";

    var data = {
      uSpaceList: uSpaceList
    }

    resultObject.data = data;

    callback(null, resultObject);
  });
}// discoverUnitSpaces
