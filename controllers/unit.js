
const async = require("async");
const request = require("request");


const constants = require('../lib/constants');


exports.manageUnit = function(unit, unitId, crudType, callback){
  console.log("manageUnit");

  var resultObject = {};

  callback(null, resultObject);
}// manageUnit
