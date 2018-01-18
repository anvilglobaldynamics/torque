
let { Api } = require('./../api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');

exports.UserLogoutApi = class extends collectionCommonMixin(Api) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
    });
  }

  handle({ body, userId, apiKey }) {
    this.database.session.findByApiKey({ apiKey }, (err, session) => {
      if (err) return this.fail(err);
      this.database.session.close({ sessionId: session.id }, (err, wasUpdated) => {
        if (!this._ensureUpdate(err, wasUpdated, "session")) return;
        this.success({ status: "success" });
      })
    })
  }

}

