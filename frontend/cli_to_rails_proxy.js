var PROXY_CONFIG = [
  {
    "context": ['/**'],
    "target": "http://192.168.75.58:3000",
    "secure": false
    // "bypass": function (req, res, proxyOptions) {
    // }
  }
];

module.exports = PROXY_CONFIG;
