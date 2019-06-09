
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { generateRandomString } = require('./../utils/random-string');
const { SecurityMixin } = require('./mixins/security-mixin');
const { UserMixin } = require('./mixins/user-mixin');

exports.UserSetEmailApi = class extends Api.mixin(SecurityMixin, UserMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      email: Joi.string().email().min(3).max(30).required(),
    });
  }

  async updateProfile({ userId, email }) {
    let user = await this.database.user.findById({ id: userId });
    throwOnFalsy(user, "USER_INAVLID", "User not found.");

    let result = await this.database.user.setEmail({ id: userId }, { email });
    this.ensureUpdate('user', result);

    if (user.email === email) return;

    result = await this.database.user.setEmailVerificationStatus({ id: userId }, { isEmailVerified: false });
    this.ensureUpdate('user', result);


    let verificationLink = await this._createEmailVerificationRequest({ email, userId });
    await this._sendEmailVerificationMail({ email, verificationLink });
  }

  async handle({ userId, body }) {
    let { email } = body;
    await this.updateProfile({ userId, email });
    return { status: "success" };
  }

}