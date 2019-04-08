
let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');

exports.UserResetPasswordGetTokenInfoApi = class extends collectionCommonMixin(LegacyApi) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return false; }

  get requestSchema() {
    return Joi.object().keys({
      uniqueToken: Joi.string().length(16).required(),
    });
  }

  _getTokenInfoIfValid({ uniqueToken: confirmationToken }, cbfn) {
    this.legacyDatabase.passwordResetRequest.findByConfirmationToken({ confirmationToken }, (err, passwordResetRequest) => {
      if (!this._ensureDoc(err, passwordResetRequest, "PASSWORD_RESET_TOKEN_INVALID", "Invalid password reset token provided.")) return;
      let { forEmail, forUserId, forPhone } = passwordResetRequest;
      let tokenInfo = { forEmail, forPhone };
      cbfn(tokenInfo);
    });

  }

  handle({ body }) {
    let { uniqueToken } = body;
    this._getTokenInfoIfValid({ uniqueToken }, (tokenInfo) => {
      this.success({ status: "success", tokenInfo });
    });
  }

}

