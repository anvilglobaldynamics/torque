
let { Api } = require('./../api-base');
let Joi = require('joi');

exports.UserPasswordResetGetTokenInfoApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return false; }

  get requestSchema() {
    return Joi.object().keys({
      uniqueToken: Joi.string().length(16).required(),
    });
  }

  _getTokenInfoIfValid({ uniqueToken: confirmationToken }, cbfn) {
    this.database.passwordResetRequest.findByConfirmationToken(confirmationToken, (err, passwordResetRequest) => {
      if (err) return this.fail(err);
      if (!passwordResetRequest) {
        let err = new Error("Invalid password reset token provided.");
        err.code = 'PASSWORD_RESET_TOKEN_INVALID';
        return this.fail(err);
      }
      let { forEmail, forUserId, forPhone } = passwordResetRequest;
      let tokenInfo = { forEmail, forPhone };
      cbfn(tokenInfo);
    });

  }

  handle({ body }) {
    let { uniqueToken } = body;
    this._getTokenInfoIfValid({ emailOrPhone }, (tokenInfo) => {
      this.success({ status: "success", tokenInfo });
    });
  }

}

