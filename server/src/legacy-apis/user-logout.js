
let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');

exports.UserLogoutApi = class extends collectionCommonMixin(LegacyApi) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
    });
  }

  handle({ body, userId, apiKey }) {
    this.legacyDatabase.session.findByApiKey({ apiKey }, (err, session) => {
      if (err) return this.fail(err);
      this.legacyDatabase.session.close({ sessionId: session.id }, (err, wasUpdated) => {
        if (!this._ensureUpdate(err, wasUpdated, "session")) return;
        this.success({ status: "success" });
      })
    })
  }

}

