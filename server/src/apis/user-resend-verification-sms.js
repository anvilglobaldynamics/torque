
let { Api } = require('./../api-base');
let Joi = require('joi');

let { phoneVerificationRequestMixin } = require('./mixins/phone-verification-request-mixin');
let { userCommonMixin } = require('./mixins/user-common');

exports.UserResendVerificationSmsApi = class extends userCommonMixin(phoneVerificationRequestMixin(Api)) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),
    });
  }

  _resendVerificationSms({ userId }, cbfn) {
    this.database.user.findById({ userId }, (err, user) => {
      if (err) return this.fail(err);
      let { phone } = user;
      this.database.user.setPhoneAsUnverified({ userId }, (err) => {
        if (err) return this.fail(err);
        this._createPhoneVerificationRequest({ phone, userId }, (verificationLink) => {
          cbfn();
          this._sendPhoneVerificationSms({ phone, verificationLink });
        });
      });
    });
  }

  handle({ body, userId, apiKey }) {
    this._resendVerificationSms({ userId }, _ => {
      this.success({ status: "success" });
    });
  }

}

