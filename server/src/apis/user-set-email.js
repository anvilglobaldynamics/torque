
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

    if (user.email === email) return;

    let existingUser = (await this.database.user.findByEmailOrPhone({ emailOrPhone: email }));
    if (existingUser) {
      throw new CodedError("EMAIL_INVALID", "The email you provided is already in use");
    }

    let result = await this.database.user.setEmail({ id: userId }, { email });
    this.ensureUpdate('user', result);

    result = await this.database.user.setEmailVerificationStatus({ id: userId }, { isEmailVerified: false });
    this.ensureUpdate('user', result);

    let verificationLink = await this._createEmailVerificationRequest({ email, userId });
    this._sendEmailVerificationMail({ email, verificationLink });
  }

  async handle({ userId, body }) {
    let { email } = body;
    await this.updateProfile({ userId, email });
    return { status: "success" };
  }

}