
let { Api } = require('./../api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');
let { phoneVerificationRequestMixin } = require('./mixins/phone-verification-request-mixin');
let { userCommonMixin } = require('./mixins/user-common');

exports.UserResendVerificationSmsApi = class extends collectionCommonMixin(userCommonMixin(phoneVerificationRequestMixin(Api))) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return false; }

  get requestSchema() {
    return Joi.object().keys({
      phone: Joi.string().alphanum().min(11).max(14).required(),
    });
  }

  _resendVerificationSms({ phone }, cbfn) {
    this.database.user.findByEmailOrPhone({ emailOrPhone: phone }, (err, user) => {
      if (!this._ensureDoc(err, user, "USER_INVALID", "Sorry. We could not find any user with that phone number.")) return;
      if (err) return this.fail(err);
      let { phone, id: userId } = user;
      this.database.user.setPhoneAsUnverified({ userId }, (err) => {
        if (err) return this.fail(err);
        this._createPhoneVerificationRequest({ phone, userId }, (verificationLink) => {
          cbfn();
          this._sendPhoneVerificationSms({ phone, verificationLink });
        });
      });
    });
  }

  handle({ body }) {
    let { phone } = body;
    this._resendVerificationSms({ phone }, _ => {
      this.success({ status: "success" });
    });
  }

}

