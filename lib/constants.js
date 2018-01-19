
module.exports = Object.freeze({
  // constants
  BACKGROUND_IMAGE : "https://s3.amazonaws.com/etri-system-light/maxresdefault.jpg",
  ECHO_SHOW_DISPLAY_WIDTH : 1659,
  ECHO_SHOW_DISPLAY_HEIGHT : 935,

  INCREASE_CODE : 1,
  DECREASE_CODE : -1,

  INCREASE_RATE : 1.1,
  DECREASE_RATE : 0.9,
  DEFAULT_RATE : 1,

  UNIT_DEVICE : "device",
  UNIT_GROUP : "group",
  UNIT_SPACE : "unit space",

  INCREASE_COMMAND : "increase",
  DECREASE_COMMAND : "decrease",

  // AWS DynamoDB Table name prefix
  TABLE_USER_DEVICES : "user/devices",

  // system light API parameters
  SL_API_POWER_ON : "on",
  SL_API_POWER_OFF : "off",

  DEFAULT_POWER : "off",
  DEFAULT_POWER_LEVEL : 100,

  // system light GW API response code
  SL_API_SUCCESS_CODE : 200,
  SL_API_FAILURE_CODE : 400
});
