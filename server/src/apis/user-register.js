
let { Api } = require('./../api-base');
let Joi = require('joi');
let cryptolib = require('crypto');

let { emailVerificationRequestMixin } = require('./mixins/email-verification-request-mixin.js');

exports.UserRegisterApi = class extends emailVerificationRequestMixin(Api) {

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

  _makeHash(string) {
    return cryptolib.createHash('sha256').update(string).digest("hex");
  }

  _createUser({ email, fullName, phone, password }, cbfn) {
    let passwordHash = this._makeHash(password);
    let user = {
      email,
      fullName,
      phone,
      passwordHash
    }
    this.database.user.create(user, (err, userId) => {
      if (err) {
        if ('code' in err && err.code === 'DUPLICATE_email') {
          err = new Error("Provided email address is already in use");
          err.code = 'EMAIL_ALREADY_IN_USE';
        }
        return this.fail(err);
      }
      return cbfn(userId);
    });
  }

  handle({ body }) {
    let { email, fullName, phone, password } = body;
    this._createUser({ email, fullName, phone, password }, (userId) => {
      this._createEmailVerificationRequest({ email, userId }, (verificationLink) => {
        this.success({ status: "success", userId });
        this._sendVerificationMail({ email, verificationLink });
      });
    });
  }

}

