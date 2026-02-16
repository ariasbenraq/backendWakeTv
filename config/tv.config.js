module.exports = {
  MAC_ADDRESS: process.env.TV_MAC_ADDRESS || "14:c9:13:7b:b7:14",
  TV_IP: process.env.TV_IP || "192.168.18.19",
  WOL_BROADCAST_ADDRESS: process.env.WOL_BROADCAST_ADDRESS || "255.255.255.255",
  WOL_PORT: Number(process.env.WOL_PORT || 9),
};
