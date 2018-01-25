
/***********
 modules
********* */
const config = require("config.json")("./config/config.json");


const constants = require('../lib/constants');

module.exports = {
  'Unhandled': function () {
    console.log("Unhandled");

    this.emit(':ask', 'What would you like to do?', 'Please say that again?');
  }// Unhandled
};// LightHandler
