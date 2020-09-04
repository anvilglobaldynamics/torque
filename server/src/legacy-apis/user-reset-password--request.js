
let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

let { generateRandomString } = require('./../utils/random-string');

let { userCommonMixin } = require('./mixins/user-common');

let { collectionCommonMixin } = require('./mixins/collection-common');

exports.UserResetPasswordRequestApi = class extends collectionCommonMixin(LegacyApi) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return false; }

  get requestSchema() {
    return Joi.object().keys({
      emailOrPhone: Joi.alternatives([
        Joi.string().email().min(3).max(30), // if email
        Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14) // if phone
      ]).required()
    });
  }

  _generateConfirmationLink(confirmationToken) {
    let { clientUrl } = this.server.config.branding;
    return `${clientUrl}/#/confirm-password-reset/token:${confirmationToken}`;
  }

  _sendPasswordResetEmail({ email, confirmationLink }) {
    let model = { email, confirmationLink };
    let clientLanguage = (this.clientLanguage || 'en-us');
    this.server.emailService.sendStoredMail(clientLanguage, 'password-reset', model, email).then(([err, isDeveloperError, response, finalBody]) => {
      if ((err) || response.message !== 'Queued. Thank you.') {
        if (err) {
          if (!isDeveloperError) this.logger.error(err);
        } else {
          this.logger.log("Unexpected emailService response:", response);
        }
        let message = 'Failed to send password reset email. Please handle the case manually.'
        this.logger.important(message, {
          type: 'password-reset',
          confirmationLink,
          model
        });
      }
    });
  }

  _sendPasswordResetSms({ phone, confirmationLink }) {
    let model = { phone, confirmationLink };
    this.server.smsService.sendStoredSms('password-reset', model, phone).then(([err, isDeveloperError, response, finalBody]) => {
      if (err) {
        if (!isDeveloperError) this.logger.error(err);
        let message = 'Failed to send password reset SMS. Please handle the case manually.'
        this.logger.important(message, {
          type: 'password-reset',
          finalBody
        });
      }
    });
    // Send a copy of the message to admin by email
    let adminEmail = 'care@anvil.live';
    let subject = `Forwarded Lipi password reset request`;
    let html = `<pre>` + JSON.stringify(model, null, 2) + `</pre>`;
    this.server.emailService.sendMail({ to: adminEmail, subject, html });
  }

  _createPasswordResetRequest({ userId, email, phone }, cbfn) {
    let confirmationToken = generateRandomString(6);
    this.legacyDatabase.passwordResetRequest.isConfirmationTokenUnique(confirmationToken, (err, isUnique) => {
      if (err) return this.fail(err);
      if (!isUnique) return this._createPasswordResetRequest({ userId, email, phone }, cbfn);
      this.legacyDatabase.passwordResetRequest.create({ userId, email, phone, origin: 'password-reset-api', confirmationToken }, (err) => {
        if (err) return this.fail(err);
        let confirmationLink = this._generateConfirmationLink(confirmationToken);
        return cbfn({ confirmationLink });
      });
    })
  }

  _getUserIfValid({ emailOrPhone }, cbfn) {
    this.legacyDatabase.user.findByEmailOrPhone({ emailOrPhone }, (err, user) => {
      if (!this._ensureDoc(err, user, "USER_NOT_FOUND", "No user registered using that email/phone.")) return;

      if (user.isBanned) {
        let err = new Error(this.verses.userLoginApi.userBanned);
        err.code = 'USER_BANNED';
        this.fail(err);
        return;
      }

      cbfn(user);
    });
  }

  handle({ body }) {
    let { emailOrPhone } = body;
    this._getUserIfValid({ emailOrPhone }, (user) => {
      let { email, phone, id: userId } = user;
      this._createPasswordResetRequest({ userId, email, phone }, ({ confirmationLink }) => {
        let type = 'phone';
        if (emailOrPhone === email) type = 'email'
        this.success({ status: "success", type });
        if (type === 'email') this._sendPasswordResetEmail({ email, confirmationLink });
        if (type === 'phone') this._sendPasswordResetSms({ phone, confirmationLink });
      });
    });
  }

}

