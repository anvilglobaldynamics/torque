
let { Api } = require('./../api-base');
let Joi = require('joi');

let { userCommonMixin } = require('./mixins/user-common');

exports.UserResetPasswordConfirmApi = class extends userCommonMixin(Api) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return false; }

  get requestSchema() {
    return Joi.object().keys({
      uniqueToken: Joi.string().length(64).required(),
      newPassword: Joi.string().regex(/^[a-zA-Z0-9]{8,30}$/).required()
    });
  }

  _getPasswordResetRequestIfValid({ uniqueToken: confirmationToken }, cbfn) {
    this.database.passwordResetRequest.findByConfirmationToken(confirmationToken, (err, passwordResetRequest) => {
      if (err) return this.fail(err);
      if (!passwordResetRequest) {
        let err = new Error("Invalid password reset token provided.");
        err.code = 'PASSWORD_RESET_TOKEN_INVALID';
        return this.fail(err);
      }
      let { forEmail, forUserId, forPhone } = passwordResetRequest;
      cbfn(passwordResetRequest);
    });
  }

  _setPasswordIfValid({ newPassword, userId }, cbfn) {
    this.database.user.getById(userId, (err, user) => {
      if (err) return this.fail(err);

      let passwordHash = this._makeHash(newPassword);
      this.database.user.setPasswordHash({ userId, passwordHash }, (err) => {
        if (err) return this.fail(err);
        cbfn();
      });
    });
  }

  _markPasswordResetRequestAsComplete({ uniqueToken: confirmationToken }, cbfn) {
    this.database.passwordResetRequest.applyConfirmationToken(confirmationToken, (err) => {
      if (err) return this.fail(err);
      cbfn();
    });
  }

  handle({ body }) {
    let { uniqueToken, newPassword } = body;
    this._getPasswordResetRequestIfValid({ uniqueToken }, (passwordResetRequest) => {
      let { forUserId: userId } = passwordResetRequest;
      this._setPasswordIfValid({ newPassword, userId }, () => {
        this._markPasswordResetRequestAsComplete({ uniqueToken }, () => {
          this.success({ status: "success" });
          this._notifyPasswordChange({ userId }, () => null);
        });
      });
    });
  }

}

