
let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

let { emailVerificationRequestMixin } = require('./mixins/email-verification-request-mixin');
let { phoneVerificationRequestMixin } = require('./mixins/phone-verification-request-mixin');
let { userCommonMixin } = require('./mixins/user-common');

exports.UserRegisterApi = class extends userCommonMixin(emailVerificationRequestMixin(phoneVerificationRequestMixin(LegacyApi))) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return false; }

  get requestSchema() {
    return Joi.object().keys({
      fullName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required(),
      password: Joi.string().min(8).max(30).required(),
      hasAgreedToToc: Joi.boolean().required().valid(true)
    });
  }

  handle({ body }) {
    let { fullName, phone, password, hasAgreedToToc } = body;
    let agreedToTocDatetimeStamp = null;
    if (hasAgreedToToc) agreedToTocDatetimeStamp = Date.now();
    this._createUser({ fullName, phone, password, agreedToTocDatetimeStamp }, (userId) => {
      this._createPhoneVerificationRequest({ phone, userId }, (verificationLink) => {
        this._sendPhoneVerificationSms({ phone, verificationLink });
        this.success({ status: "success", userId });
      });
    });
  }

}

