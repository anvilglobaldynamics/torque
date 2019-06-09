
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
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required(),
      password: Joi.string().min(8).max(30).required(),
      hasAgreedToToc: Joi.boolean().required().valid(true)
    });
  }

  async _createUser({ fullName, phone, password, agreedToTocDatetimeStamp }) {
    let passwordHash = this._makeHash(password);
    let userId = await this.database.user.create({ fullName, phone, passwordHash, agreedToTocDatetimeStamp });
    return userId;
  }

  async handle({ body }) {
    let { fullName, phone, password, hasAgreedToToc } = body;

    let agreedToTocDatetimeStamp = (hasAgreedToToc ? Date.now() : null);

    let userId = await this._createUser({ fullName, phone, password, agreedToTocDatetimeStamp });

    let verificationLink = await this._createPhoneVerificationRequest({ phone, userId });
    this._sendPhoneVerificationSms({ phone, verificationLink }) // willingly not awaiting

    return { status: "success", userId };
  }

}