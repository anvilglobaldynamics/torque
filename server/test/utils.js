
let request = require('request');

let genUrl = exports.genUrl = (path) => {
  return "http://localhost:8540/" + path
}

exports.callApi = (...args) => {
  args[0] = genUrl(args[0]);
  request.post(...args);
}