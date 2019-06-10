
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { generateRandomString } = require('./../utils/random-string');
const { SecurityMixin } = require('./mixins/security-mixin');
const { UserMixin } = require('./mixins/user-mixin');

exports.UserChangePasswordApi = class extends Api.mixin(SecurityMixin, UserMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      apiKey: Joi.string().length(64).required(),
      oldPassword: Joi.string().min(8).max(30).required(),
      newPassword: Joi.string().min(8).max(30).required()
    });
  }

  async _changePassword({ userId, oldPassword, newPassword }) {
    let user = await this.database.user.findById({id: userId});
    throwOnFalsy(user, "USER_INAVLID", "User not found.");

    let oldPasswordHash = this._makeHash(oldPassword);
    if (oldPasswordHash !== user.passwordHash) {
      throw new CodedError("PASSWORD_INVALID", "Old Password is invalid.");
    }

    let passwordHash = this._makeHash(newPassword);
    let result = await this.database.user.setPasswordHash({id:userId}, {passwordHash});
    this.ensureUpdate('user', result);
  }

  async handle({ userId, body }) {
    let { oldPassword, newPassword } = body;
    await this._changePassword({ userId, oldPassword, newPassword });
    this._notifyPasswordChange({ userId });
    return { status: "success" };
  }

}