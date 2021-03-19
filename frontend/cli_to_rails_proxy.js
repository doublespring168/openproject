var PROXY_CONFIG = [
  {
    "context": ['/**'],
    "target": "http://192.168.3.89:3000",
    "secure": false
    // "bypass": function (req, res, proxyOptions) {
    // }
  }
];

module.exports = PROXY_CONFIG;
