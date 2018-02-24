
let { Api } = require('./../api-base');
let Joi = require('joi');

let { emailVerificationRequestMixin } = require('./mixins/email-verification-request-mixin');
let { userCommonMixin } = require('./mixins/user-common');

exports.UserResendVerificationEmailApi = class extends userCommonMixin(emailVerificationRequestMixin(Api)) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),
    });
  }

  _resendVerificationEmail({ userId }, cbfn) {
    this.database.user.findById({ userId }, (err, user) => {
      if (err) return this.fail(err);
      let { email } = user;
      this.database.user.setEmailAsUnverified({ userId }, (err) => {
        if (err) return this.fail(err);
        this._createEmailVerificationRequest({ email, userId }, (verificationLink) => {
          cbfn();
          this._sendEmailVerificationMail({ email, verificationLink });
        });
      });
    });
  }

  handle({ body, userId, apiKey }) {
    this._resendVerificationEmail({ userId }, _ => {
      this.success({ status: "success" });
    });
  }

}

