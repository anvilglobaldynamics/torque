
let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');
let { phoneVerificationRequestMixin } = require('./mixins/phone-verification-request-mixin');
let { userCommonMixin } = require('./mixins/user-common');

exports.UserResendVerificationSmsApi = class extends collectionCommonMixin(userCommonMixin(phoneVerificationRequestMixin(LegacyApi))) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return false; }

  get requestSchema() {
    return Joi.object().keys({
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).required()
    });
  }

  _resendVerificationSms({ phone }, cbfn) {
    this.legacyDatabase.user.findByEmailOrPhone({ emailOrPhone: phone }, (err, user) => {
      if (!this._ensureDoc(err, user, "USER_INVALID", "Sorry. We could not find any user with that phone number.")) return;
      if (err) return this.fail(err);
      let { phone, id: userId } = user;
      this.legacyDatabase.user.setPhoneAsUnverified({ userId }, (err) => {
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

