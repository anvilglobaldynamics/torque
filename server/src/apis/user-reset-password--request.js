
let { Api } = require('./../api-base');
let Joi = require('joi');

let { generateRandomString } = require('./../utils/random-string');

let { userCommonMixin } = require('./mixins/user-common');

let { collectionCommonMixin } = require('./mixins/collection-common');

exports.UserResetPasswordRequestApi = class extends collectionCommonMixin(Api) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return false; }

  get requestSchema() {
    return Joi.object().keys({
      emailOrPhone: Joi.alternatives([
        Joi.string().email().min(3).max(30), // if email
        Joi.string().alphanum().min(11).max(14), // if phone
      ]).required()
    });
  }

  _generateConfirmationLink(confirmationToken) {
    let { clientUrl } = this.server.config.branding;
    return `${clientUrl}/#/confirm-password-reset/token:${confirmationToken}`;
  }

  _sendPasswordResetEmail({ email, confirmationLink }) {
    let model = { email, confirmationLink };
    this.server.emailService.sendStoredMail('password-reset', model, email, (err, isDeveloperError, response, finalBody) => {
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
    this.server.smsService.sendStoredSms('password-reset', model, phone, (err, isDeveloperError, response, finalBody) => {
      if (err) {
        if (!isDeveloperError) this.logger.error(err);
        let message = 'Failed to send password reset SMS. Please handle the case manually.'
        this.logger.important(message, {
          type: 'password-reset',
          finalBody
        });
      }
    });
  }

  _createPasswordResetRequest({ userId, email, phone }, cbfn) {
    let confirmationToken = generateRandomString(64);
    this.database.passwordResetRequest.isConfirmationTokenUnique(confirmationToken, (err, isUnique) => {
      if (err) return this.fail(err);
      if (!isUnique) return this._createPasswordResetRequest({ userId, email, phone }, cbfn);
      this.database.passwordResetRequest.create({ userId, email, phone, origin: 'password-reset-api', confirmationToken }, (err) => {
        if (err) return this.fail(err);
        let confirmationLink = this._generateConfirmationLink(confirmationToken);
        return cbfn({ confirmationLink });
      });
    })
  }

  _getUserIfValid({ emailOrPhone }, cbfn) {
    this.database.user.findByEmailOrPhone({ emailOrPhone }, (err, user) => {
      if (!this._ensureDoc(err, user, "USER_NOT_FOUND", "No user matched the email and password combination")) return;
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

