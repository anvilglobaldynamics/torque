
let { Api } = require('./../api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');
let { emailVerificationRequestMixin } = require('./mixins/email-verification-request-mixin');
let { userCommonMixin } = require('./mixins/user-common');

exports.UserResendVerificationEmailApi = class extends collectionCommonMixin(userCommonMixin(emailVerificationRequestMixin(Api))) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return false; }

  get requestSchema() {
    return Joi.object().keys({
      email: Joi.string().email().min(3).max(30).required()
    });
  }

  _resendVerificationEmail({ email }, cbfn) {
    this.database.user.findByEmailOrPhone({ emailOrPhone: email }, (err, user) => {
      if (!this._ensureDoc(err, user, "USER_INVALID", "Sorry. We could not find any user with that phone number.")) return;
      let { email, id: userId } = user;
      this.database.user.setEmailAsUnverified({ userId }, (err) => {
        if (err) return this.fail(err);
        this._createEmailVerificationRequest({ email, userId }, (verificationLink) => {
          cbfn();
          this._sendEmailVerificationMail({ email, verificationLink });
        });
      });
    });
  }

  handle({ body }) {
    let { email } = body;
    this._resendVerificationEmail({ email }, _ => {
      this.success({ status: "success" });
    });
  }

}

