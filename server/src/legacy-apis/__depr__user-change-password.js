
let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

let { userCommonMixin } = require('./mixins/user-common');

exports.UserChangePasswordApi = class extends userCommonMixin(LegacyApi) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      apiKey: Joi.string().length(64).required(),
      oldPassword: Joi.string().min(8).max(30).required(),
      newPassword: Joi.string().min(8).max(30).required()
    });
  }

  _changePassword({ userId, oldPassword, newPassword }, cbfn) {
    this.legacyDatabase.user.findById({ userId }, (err, user) => {
      if (err) return this.fail(err);

      let oldPasswordHash = this._makeHash(oldPassword);
      if (oldPasswordHash !== user.passwordHash) {
        err = new Error("Old Password is invalid.");
        return this.fail(err);
      }

      let passwordHash = this._makeHash(newPassword);
      this.legacyDatabase.user.setPasswordHash({ userId }, { passwordHash }, (err) => {
        if (err) return this.fail(err);
        cbfn();
      });
    });
  }

  handle({ body, userId, apiKey }) {
    let { oldPassword, newPassword } = body;
    this._changePassword({ userId, oldPassword, newPassword }, _ => {
      this.success({ status: "success" });
      this._notifyPasswordChange({ userId });
    });
  }

}

