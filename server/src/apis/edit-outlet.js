let { Api } = require('./../api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');

exports.EditOutletApi = class extends collectionCommonMixin(Api) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),
      outletId: Joi.number().max(999999999999999).required(),

      name: Joi.string().min(1).max(64).required(),
      physicalAddress: Joi.string().min(1).max(128).required(),
      phone: Joi.string().alphanum().min(11).max(14).required(),
      contactPersonName: Joi.string().min(1).max(64).required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: {
        from: "outlet",
        query: ({ outletId }) => ({ id: outletId }),
        select: "organizationId"
      },
      privileges: [
        "PRIV_MODIFY_ALL_OUTLETS"
      ]
    }];
  }

  _updateOutlet({ outletId, name, physicalAddress, phone, contactPersonName }, cbfn) {
    this.database.outlet.update({ outletId }, { name, physicalAddress, phone, contactPersonName }, (err, wasUpdated) => {
      if (!this._ensureUpdate(err, wasUpdated, "outlet")) return;
      return cbfn();
    });
  }

  handle({ body, userId }) {
    let { outletId, name, physicalAddress, phone, contactPersonName } = body;
    this._updateOutlet({ outletId, name, physicalAddress, phone, contactPersonName }, _ => {
      this.success({ status: "success" });
    });
  }

}