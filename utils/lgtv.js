const createLgtv = require("lgtv2");
const { TV_IP } = require("../config/tv.config");

module.exports = () => {
  return createLgtv({
    url: `ws://${TV_IP}:3000`,
    reconnect: false,
  });
};
