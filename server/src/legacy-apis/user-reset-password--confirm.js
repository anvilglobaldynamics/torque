
let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

let { userCommonMixin } = require('./mixins/user-common');

let { collectionCommonMixin } = require('./mixins/collection-common');

exports.UserResetPasswordConfirmApi = class extends userCommonMixin(collectionCommonMixin(LegacyApi)) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return false; }

  get requestSchema() {
    return Joi.object().keys({
      uniqueToken: Joi.string().length(6).required(),
      newPassword: Joi.string().min(6).max(30).required()
    });
  }

  _getPasswordResetRequestIfValid({ uniqueToken: confirmationToken }, cbfn) {
    this.legacyDatabase.passwordResetRequest.findByConfirmationToken({ confirmationToken }, (err, passwordResetRequest) => {
      if (!this._ensureDoc(err, passwordResetRequest, "PASSWORD_RESET_TOKEN_INVALID", "Invalid password reset token provided.")) return;
      let { forEmail, forUserId, forPhone } = passwordResetRequest;
      cbfn(passwordResetRequest);
    });
  }

  _setPasswordIfValid({ newPassword, userId }, cbfn) {
    this.legacyDatabase.user.findById({ userId }, (err, user) => {
      if (err) return this.fail(err);

      let passwordHash = this._makeHash(newPassword);
      this.legacyDatabase.user.setPasswordHash({ userId }, { passwordHash }, (err) => {
        if (err) return this.fail(err);
        cbfn();
      });
    });
  }

  _markPasswordResetRequestAsComplete({ uniqueToken: confirmationToken }, cbfn) {
    this.legacyDatabase.passwordResetRequest.applyConfirmationToken({ confirmationToken }, (err) => {
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
          this.legacyDatabase.session.expireByUserIdWhenLoggedInFromAnotherDevice({userId}, ()=>{
            this.success({ status: "success" });
            this._notifyPasswordChange({ userId });
          });
        });
      });
    });
  }

}

