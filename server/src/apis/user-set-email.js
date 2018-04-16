
let { Api } = require('./../api-base');
let Joi = require('joi');

let { emailVerificationRequestMixin } = require('./mixins/email-verification-request-mixin');
let { userCommonMixin } = require('./mixins/user-common');

exports.UserSetEmailApi = class extends userCommonMixin(emailVerificationRequestMixin(Api)) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      email: Joi.string().email().min(3).max(30).required(),      
    });
  }

  _updateProfile(data, cbfn) {
    let { userId, email } = data;
    data = { userId, email };

    this.legacyDatabase.user.findById({ userId }, (err, user) => {
      if (err) return this.fail(err);

      this.legacyDatabase.user.setEmail({ userId }, data, (err) => {
        if (err) return this.fail(err);

        if (user.email !== email) {
          this.legacyDatabase.user.setEmailAsUnverified({ userId }, (err) => {
            if (err) return this.fail(err);

            this._createEmailVerificationRequest({ email, userId }, (verificationLink) => {
              cbfn();
              this._sendEmailVerificationMail({ email, verificationLink });
            });
          });
        } else {
          cbfn();
        }

      });
    });
  }

  handle({ body, userId, apiKey }) {
    let { email } = body;
    this._updateProfile({ userId, email }, _ => {
      this.success({ status: "success" });
    });
  }

}

