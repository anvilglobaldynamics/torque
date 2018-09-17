let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

const importantEnvironmentVariableList = [
  "GAE_APPLICATION",
  "GAE_DEPLOYMENT_ID",
  "GAE_ENV",
  "GAE_INSTANCE",
  "GAE_MEMORY_MB",
  "GAE_RUNTIME",
  "GAE_SERVICE",
  "GAE_VERSION",
  "GOOGLE_CLOUD_PROJECT",
  "NODE_ENV",
  "PORT"
]

exports.InternalStatusApi = class extends LegacyApi {

  _showSuccess() {
    let body = "Server: Online<br>"
    body += "APIs: Active<br>"
    body += "LegacyDatabase: Active<br>"
    body += "Email System: Disabled<br>"
    body += "SMS System: Disabled<br>"
    body += "Requests Served: Not Exposed<br>"
    body += "Errors Logged: Not Exposed<br>"
    let env = {};
    importantEnvironmentVariableList.forEach(key => env[key] = process.env[key]);
    body += "ENV: <pre>" + JSON.stringify(env, null, 2) + "</pre><br>"
    this.sendGenericHtmlMessage("Server Status", body);
  }

  handle() {
    this._showSuccess();
  }

}