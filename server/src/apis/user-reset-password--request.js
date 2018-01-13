
let { Api } = require('./../api-base');
let Joi = require('joi');

let { generateRandomString } = require('./../utils/random-string');

let { userCommonMixin } = require('./mixins/user-common');

exports.UserResetPasswordRequestApi = class extends Api {

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
    return `https://torque.com/#/confirm-password-reset/token:${confirmationToken}`;
  }

  _sendPasswordResetEmail({ email, confirmationLink }) {
    let model = { email, confirmationLink };
    this.server.emailService.sendStoredMail('password-reset', model, email, (err, response) => {
      if ((err) || response.message !== 'Queued. Thank you.') {
        if (err) {
          this.logger.error(err);
        } else {
          this.logger.log("Unexpected emailService response:", response);
        }
        let message = 'Failed to send confirmation email. Please handle the case manually.'
        this.logger.important(message, model);
      }
    });
  }

  _createPasswordResetRequest({ userId, email, phone }, cbfn) {
    let confirmationToken = generateRandomString(64);
    this.database.passwordResetRequest.isConfirmationTokenUnique(confirmationToken, (err, isUnique) => {
      if (err) return this.fail(err);
      if (!isUnique) return this._createPasswordResetRequest({ userId, email, phone }, cbfn);
      this.database.passwordResetRequest.create({ userId, email, phone, origin: 'password-reset-api', confirmationToken }, (err) => {
        let confirmationLink = this._generateConfirmationLink(confirmationToken);
        return cbfn(confirmationLink);
      });
    })
  }

  _getUserIfValid({ emailOrPhone }, cbfn) {
    this.database.user.findByEmailOrPhone({ emailOrPhone }, (err, user) => {
      if (err) return this.fail(err);
      if (!user) {
        let err = new Error("No user matched the email and password combination");
        err.code = 'USER_NOT_FOUND';
        return this.fail(err);
      }
      cbfn(user);
    });
  }

  handle({ body }) {
    let { emailOrPhone } = body;
    this._getUserIfValid({ emailOrPhone }, (user) => {
      let { email, phone, id: userId } = user;
      this._createPasswordResetRequest({ userId, email, phone }, ({ confirmationLink }) => {
        this.success({ status: "success" });
        this._sendPasswordResetEmail({ email, confirmationLink });
      });
    });
  }

}

