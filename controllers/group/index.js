
const async = require("async");
const config = require("config.json")("./config/config.json");
const request = require("request");


const constants = require('../../lib/constants');
const makeGatewayURL = require('../../js/make_gateway_URL');


exports.createGroup = function(gatewayObject, groupId, callback){
  console.log("createGroup");

  var resultObject = {};

  const ip = gatewayObject.ip;
  const port = gatewayObject.tcp_port;
  const version = config.sl.gw.version;

  const gatewayURL = makeGatewayURL(ip, port, version);
  const requestURL = gatewayURL + "/group";

  const groupName = constants.GROUP_NAME_PREFIX + groupId;
  const lightList = [];

  var body = {};
  body.group_name = groupName;
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

    var dataObject = JSON.parse(body);

    const gdid = dataObject.result_data.gdid;

    var data = {
      groupName : groupName,
      gdid: gdid
    }

    resultObject.data = data;

    callback(null, resultObject);
  });
}// createGroup


exports.discoverGroups = function(gatewayObject, callback){
  console.log("discoverGroups");

  var resultObject = {};

  const ip = gatewayObject.ip;
  const port = gatewayObject.tcp_port;
  const version = config.sl.gw.version;

  const gatewayURL = makeGatewayURL(ip, port, version);
  const requestURL = gatewayURL + "/group";

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

    var groupList = dataObject.result_data.group_list;

    resultObject.code = constants.SL_API_SUCCESS_CODE;
    resultObject.message = "success";

    var data = {
      groupList: groupList
    }

    resultObject.data = data;

    callback(null, resultObject);
  });
}// discoverGroups

exports.removeGroup = function(groupId, callback){
  console.log("removeGroup");

  var resultObject = {};

  callback(null, resultObject);
}// removeGroup

exports.addLightToGroup = function(deviceObject, groupId, callback){
  console.log("addLightToGroup");

  var resultObject = {};

  callback(null, resultObject);
}// addLightToGroup


exports.loadLightFromGroup = function(groupId, callback){
  console.log("loadLightFromGroup");

  var resultObject = {};

  callback(null, resultObject);
}// loadLightFromGroup


exports.removeLightFromGroup = function(deviceId, groupId, callback){
  console.log("removeLightFromGroup");

  var resultObject = {};

  callback(null, resultObject);
}// removeLightFromGroup
