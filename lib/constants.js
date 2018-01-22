
module.exports = Object.freeze({
  // constants
  BACKGROUND_IMAGE : "https://s3.amazonaws.com/etri-system-light/maxresdefault.jpg",
  ECHO_SHOW_DISPLAY_WIDTH : 1659,
  ECHO_SHOW_DISPLAY_HEIGHT : 935,

  INCREASE_CODE : 1,
  DECREASE_CODE : -1,
  DEFAULT_CODE : 0,

  INCREASE_RATE : 1.1,
  DECREASE_RATE : 0.9,
  DEFAULT_RATE : 1,

  UNIT_DEVICE : "device",
  UNIT_GROUP : "group",
  UNIT_SPACE : "unit space",

  INCREASE_COMMAND : "increase",
  DECREASE_COMMAND : "decrease",

  // Response
  RESPONSE_SPEAK : 0,
  RESPONSE_SPEAK_AND_LISTEN : 1,

  // AWS DynamoDB Table name
  TABLE_USER_GATEWAY_FLAG : "user/gateway/flag",
  TABLE_USER_GATEWAY : "user/gateway",
  TABLE_USER_DEVICES_FLAG : "user/devices/flag",
  TABLE_USER_DEVICES : "user/devices",
  TABLE_USER_GROUP : "user/group",

  // system light API parameters
  SL_API_POWER_ON : "on",
  SL_API_POWER_OFF : "off",

  DEFAULT_POWER : "off",
  DEFAULT_POWER_LEVEL : 100,

  DEFAULT_BRIGHTNESS : 70,

  DEFAULT_COLOR_TEMPERATURE : 5000,

  // system light GW API response code
  SL_API_SUCCESS_CODE : 200,
  SL_API_FAILURE_CODE : 400
});
