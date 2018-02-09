let { Api } = require('./../api-base');
let Joi = require('joi');

exports.InternalStatus = class extends Api {

  _showSuccess() {
    let body = "Server: Online<br>"
    body += "APIs: Active<br>"
    body += "Database: Active<br>"
    body += "Email System: Disabled<br>"
    body += "SMS System: Disabled<br>"
    body += "Requests Served: Not Exposed<br>"
    body += "Errors Logged: Not Exposed<br>"
    this.sendGenericHtmlMessage("Server Status", body);
  }

  handle() {
    this._showSuccess();
  }

}