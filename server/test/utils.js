
let request = require('request');

let genUrl = exports.genUrl = (path) => {
  return "http://localhost:8540/" + path
}

exports.callApi = (...args) => {
  // if (args[0]==='api/add-sales'){
  //   args[1].json.wasOfflineSale = true;
  // }
  args[0] = genUrl(args[0]);
  request.post(...args);
}

exports.callGetApi = (...args) => {
  args[0] = genUrl(args[0]);
  request.get(...args);
}