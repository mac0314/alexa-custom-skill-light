
module.exports = Object.freeze({
  // constants
  INCREASE_CODE : 1,
  DECREASE_CODE : -1,

  INCREASE_RATE : 1.1,
  DECREASE_RATE : 0.9,
  DEFAULT_RATE : 1,

  INCREASE_COMMAND : "increase",
  DECREASE_COMMAND : "decrease",

  // system light API parameters
  SL_API_POWER_ON : "on",
  SL_API_POWER_OFF : "off",

  DEFAULT_POWER_LEVEL : 1000,

  // system light GW API response code
  SL_API_SUCCESS_CODE : 200,
  SL_API_FAILURE_CODE : 400
});
