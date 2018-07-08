let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');

exports.AdminSetOutgoingSmsStatusApi = class extends collectionCommonMixin(LegacyApi) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get authenticationLevel() { return 'admin'; }

  get requestSchema() {
    return Joi.object().keys({
      apiKey: Joi.string().length(64).required(),
      status: Joi.string().valid('pending', 'sent', 'delivered', 'canceled').required(),
      outgoingSmsId: Joi.number().max(999999999999999).required()
    });
  }

  _updateOutgoingSmsStatus({ status, outgoingSmsId }, cbfn) {
    this.legacyDatabase.outgoingSms.updateStatus({ outgoingSmsId }, { status }, (err, wasUpdated) => {
      if (!this._ensureUpdate(err, wasUpdated, "outgoingSms")) return;
      return cbfn();
    });
  }

  handle({ body }) {
    let { status, outgoingSmsId } = body;
    this._updateOutgoingSmsStatus({ status, outgoingSmsId }, () => {
      this.success({ status: 'success' });
    });
  }

}