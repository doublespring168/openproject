var PROXY_CONFIG = [
  {
    "context": ['/**'],
    "target": "http://192.168.1.211:3000",
    "secure": false
    // "bypass": function (req, res, proxyOptions) {
    // }
  }
];

module.exports = PROXY_CONFIG;
