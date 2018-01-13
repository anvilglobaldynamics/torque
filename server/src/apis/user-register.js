
let { Api } = require('./../api-base');
let Joi = require('joi');

let { emailVerificationRequestMixin } = require('./mixins/email-verification-request-mixin');
let { phoneVerificationRequestMixin } = require('./mixins/phone-verification-request-mixin');
let { userCommonMixin } = require('./mixins/user-common');

exports.UserRegisterApi = class extends userCommonMixin(emailVerificationRequestMixin(phoneVerificationRequestMixin(Api))) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return false; }

  get requestSchema() {
    return Joi.object().keys({
      email: Joi.string().email().min(3).max(30).required(),
      fullName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().alphanum().min(11).max(14).required(),
      password: Joi.string().regex(/^[a-zA-Z0-9]{8,30}$/).required()
    });
  }

  handle({ body }) {
    let { email, fullName, phone, password } = body;
    this._createUser({ email, fullName, phone, password }, (userId) => {
      this._createEmailVerificationRequest({ email, userId }, (verificationLink) => {
        this._sendEmailVerificationMail({ email, verificationLink });
        this._createPhoneVerificationRequest({ phone, userId }, (verificationLink) => {
          this._sendPhoneVerificationSms({ phone, verificationLink });
          this.success({ status: "success", userId });
        });
      });
    });
  }

}

