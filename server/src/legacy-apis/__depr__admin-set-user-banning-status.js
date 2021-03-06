let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');
let { userCommonMixin } = require('./mixins/user-common');

exports.AdminSetUserBanningStatusApi = class extends userCommonMixin(collectionCommonMixin(LegacyApi)) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get authenticationLevel() { return 'admin'; }

  get requestSchema() {
    return Joi.object().keys({
      apiKey: Joi.string().length(64).required(),
      isBanned: Joi.boolean().required(),
      userId: Joi.number().max(999999999999999).required(),
    });
  }

  _updateUserBanningStatus({ isBanned, userId }, cbfn) {
    this.legacyDatabase.user.updateBanningStatus({ userId }, { isBanned }, (err, wasUpdated) => {
      if (!this._ensureUpdate(err, wasUpdated, "user")) return;
      this._expireUserSessionRemotely({ userId }, () => {
        return cbfn();
      });
    });
  }

  handle({ body }) {
    let { isBanned, userId } = body;
    this._updateUserBanningStatus({ isBanned, userId }, () => {
      this.success({ status: 'success' });
    });
  }

}