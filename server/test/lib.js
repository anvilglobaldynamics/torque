
let { callApi } = require('./utils');
let { Program } = require('./../src/index');

let mainProgram = new Program({ allowUnsafeApis: false, muteLogger: true });
let hasStarted = false;
let pendingTerminationRequest = false;

// ===================================== Server

exports.initializeServer = (callback) => {
  pendingTerminationRequest = false;
  if (hasStarted) {
    setTimeout(_ => {
      callback();
    }, 10);
    return;
  }
  mainProgram.initiateServer(_ => {
    hasStarted = true;
    setTimeout(_ => {
      callback();
    }, 10);
  });
}

exports.terminateServer = (callback) => {
  pendingTerminationRequest = true;
  setTimeout(_ => {
    if (pendingTerminationRequest) {
      mainProgram.terminateServer();
    }
  }, 300);
  callback();
}

// ===================================== User

exports.registerUser = (data, callback) => {
  callApi('api/user-register', {
    json: data
  }, (err, response, body) => {
    callback(body);
  })
}

exports.loginUser = (data, callback) => {
  callApi('api/user-login', {
    json: data
  }, (err, response, body) => {
    callback(body);
  })
}

// ===================================== Organization

exports.addOrganization = (data, callback) => {
  callApi('api/add-organization', {
    json: data
  }, (err, response, body) => {
    callback(body);
  })
}
