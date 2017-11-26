
let { Api } = require('./../api-base');
let Joi = require('joi');

let { userCommonMixin } = require('./mixins/user-common');

exports.UserChangePasswordApi = class extends userCommonMixin(Api) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      apiKey: Joi.string().length(64).required(),
      oldPassword: Joi.string().regex(/^[a-zA-Z0-9]{8,30}$/).required(),
      newPassword: Joi.string().regex(/^[a-zA-Z0-9]{8,30}$/).required()
    });
  }

  _changePassword({ userId, oldPassword, newPassword }, cbfn) {
    this.database.user.getById(userId, (err, user) => {
      if (err) return this.fail(err);

      let oldPasswordHash = this._makeHash(oldPassword);
      if (oldPasswordHash !== user.passwordHash) {
        err = new Error("Old Password is invalid.");
        return this.fail(err);
      }

      let passwordHash = this._makeHash(newPassword);
      this.database.user.setPasswordHash({ userId, passwordHash }, (err) => {
        if (err) return this.fail(err);
      });
      cbfn();
    });
  }

  _notifyPasswordChange({ userId }, cbfn) {
    this.database.user.getById(userId, (err, user) => {
      if (err) return this.fail(err);
      let email = user.email;
      let model = { email };
      this.server.emailService.sendStoredMail('generic-message', model, email, (err, response) => {
        if ((err) || response.message !== 'Queued. Thank you.') {
          this.logger.error(err);
          this.logger.log("Mailgun Response", response);
        }
      });
    });
  }

  handle({ body, userId, apiKey }) {
    let { oldPassword, newPassword } = body;
    this._changePassword({ userId, oldPassword, newPassword }, _ => {
      this.success({ status: "success" });
      this._notifyPasswordChange({ userId }, _ => null);
    });
  }

}

