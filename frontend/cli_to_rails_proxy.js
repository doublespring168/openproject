var PROXY_CONFIG = [
  {
    "context": ['/**'],
    "target": "http://192.168.0.100:3006",
    "secure": false
    // "bypass": function (req, res, proxyOptions) {
    // }
  }
];

module.exports = PROXY_CONFIG;
