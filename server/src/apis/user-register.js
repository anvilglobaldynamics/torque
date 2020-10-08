
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { SecurityMixin } = require('./mixins/security-mixin');
const { UserMixin } = require('./mixins/user-mixin');

exports.UserRegisterApi = class extends Api.mixin(SecurityMixin, UserMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return false; }

  get isEnabled() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      fullName: Joi.string().min(1).max(64).required(),

      email: Joi.string().email().min(3).max(30).required(),

      password: Joi.string().min(6).max(30).required(),
      hasAgreedToToc: Joi.boolean().required().valid(true)
    });
  }

  async handle({ body }) {
    let { fullName, email, password, hasAgreedToToc } = body;

    let agreedToTocDatetimeStamp = (hasAgreedToToc ? Date.now() : null);

    let userId = await this._createUser({ fullName, email, password, agreedToTocDatetimeStamp, accessibleApplicationList: ['torque'] });

    let verificationLink = await this._createEmailVerificationRequest({ email, userId });
    this._sendEmailVerificationMail({ email, verificationLink });

    return { status: "success", userId };
  }

}