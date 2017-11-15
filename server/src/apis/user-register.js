
let { Api } = require('./../api-base');
let Joi = require('joi');
let cryptolib = require('crypto');
let { generateRandomString } = require('./../utils/random-string');

exports.UserRegisterApi = class extends Api {

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

  _generateVerificationLink(verificationToken) {
    return `https://server1.rewardables.life/verify-email/${verificationToken}`;
  }

  _makeHash(string) {
    return cryptolib.createHash('sha256').update(string).digest("hex");
  }

  _sendVerificationMail({ email, verificationLink: activationLink }) {
    let model = { email, activationLink };
    this.server.emailService.sendStoredMail('email-verification', model, email, (err, response) => {
      if ((err) || response.message !== 'Queued. Thank you.') {
        this.logger.error(err);
        this.logger.log("Mailgun Response", response);
        let message = 'Failed to send verification email. Please handle the case manually.'
        this.logger.important(message, model);
      }
    });
  }

  _createUser({ email, fullName, phone, password }, cbfn) {
    let passwordHash = this._makeHash(password);
    let user = {
      email,
      fullName,
      phone,
      passwordHash
    }
    this.database.createUser(user, (err, userId) => {
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

  _createEmailVerificationRequest({ email, userId }, cbfn) {
    let verificationToken = generateRandomString(64);
    this.database.ensureVerificationTokenIsUnique(verificationToken, (err, isUnique) => {
      if (err) return this.fail(err);
      if (!isUnique) return this._createEmailVerificationRequest({ email }, cbfn);
      this.database.createEmailVerificationRequest({ userId, email, origin: 'user-register', verificationToken }, (err) => {
        let verificationLink = this._generateVerificationLink(verificationToken);
        return cbfn(verificationLink);
      });
    })
  }

  handle({ body }) {
    let { email, fullName, phone, password } = body;
    this._createUser({ email, fullName, phone, password }, (userId) => {
      this.success({ status: "success" });
      this._createEmailVerificationRequest({ email, userId }, (verificationLink) => {
        this._sendVerificationMail({ email, verificationLink });
      });
    });




  }

}

