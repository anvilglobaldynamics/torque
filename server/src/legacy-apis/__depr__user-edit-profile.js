
let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

let { emailVerificationRequestMixin } = require('./mixins/email-verification-request-mixin');
let { phoneVerificationRequestMixin } = require('./mixins/phone-verification-request-mixin');
let { userCommonMixin } = require('./mixins/user-common');

exports.UserEditProfileApi = class extends userCommonMixin(phoneVerificationRequestMixin(emailVerificationRequestMixin(LegacyApi))) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      email: Joi.string().email().min(3).max(30).allow(null).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required(),

      fullName: Joi.string().min(1).max(64).required(),
      nid: Joi.string().allow('').min(16).max(16).required(),
      physicalAddress: Joi.string().allow('').min(1).max(128).required(),
      emergencyContact: Joi.string().allow('').min(1).max(128).required(),
      bloodGroup: Joi.string().allow('').min(2).max(3).required()
    });
  }

  _updateProfile(data, cbfn) {
    let { userId, email, phone, fullName, nid, physicalAddress, emergencyContact, bloodGroup } = data;
    data = { userId, email, phone, fullName, nid, physicalAddress, emergencyContact, bloodGroup };

    this.legacyDatabase.user.findById({ userId }, (err, user) => {
      if (err) return this.fail(err);

      this.legacyDatabase.user.update({ userId }, data, (err) => {
        if (err) return this.fail(err);

        let doesRequireLogin = false;
        let promiseList = [];

        if (user.email !== email) {
          doesRequireLogin = true;
          promiseList.push(new Promise((accept, reject) => {
            this.legacyDatabase.user.setEmailAsUnverified({ userId }, (err) => {
              if (err) return reject(err);
              this._createEmailVerificationRequest({ email, userId }, (verificationLink) => {
                accept();
                this._sendEmailVerificationMail({ email, verificationLink });
              });
            });
          }));
        }

        if (user.phone !== phone) {
          doesRequireLogin = true;
          promiseList.push(new Promise((accept, reject) => {
            this.legacyDatabase.user.setPhoneAsUnverified({ userId }, (err) => {
              if (err) return reject(err);
              this._createPhoneVerificationRequest({ phone, userId }, (verificationLink) => {
                accept();
                this._sendPhoneVerificationSms({ phone, verificationLink });
              });
            });
          }));
        }

        Promise.all(promiseList)
          .catch((ex) => {
            if (ex) return this.fail(ex);
          }).then(() => {
            cbfn(doesRequireLogin);
          });

      });
    });
  }

  handle({ body, userId, apiKey }) {
    let { email, phone, fullName, nid, physicalAddress, emergencyContact, bloodGroup } = body;
    this._updateProfile({ userId, email, phone, fullName, nid, physicalAddress, emergencyContact, bloodGroup }, (doesRequireLogin) => {
      this.success({ status: "success", doesRequireLogin });
    });
  }

}

