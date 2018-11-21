let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');

exports.EditOutletApi = class extends collectionCommonMixin(LegacyApi) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),
      outletId: Joi.number().max(999999999999999).required(),

      name: Joi.string().min(1).max(64).required(),
      physicalAddress: Joi.string().min(1).max(128).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required(),
      contactPersonName: Joi.string().min(1).max(64).required(),
      location: Joi.object().keys({
        lat: Joi.number().required(),
        lng: Joi.number().required()
      }).required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: {
        from: "outlet",
        query: ({ outletId }) => ({ id: outletId }),
        select: "organizationId",
        errorCode: "OUTLET_INVALID"
      },
      privilegeList: [
        "PRIV_MODIFY_ALL_OUTLETS"
      ]
    }];
  }

  _updateOutlet({ outletId, name, physicalAddress, phone, contactPersonName, location }, cbfn) {
    this.legacyDatabase.outlet.update({ outletId }, { name, physicalAddress, phone, contactPersonName, location }, (err, wasUpdated) => {
      if (!this._ensureUpdate(err, wasUpdated, "outlet")) return;
      return cbfn();
    });
  }

  handle({ body, userId }) {
    let { outletId, name, physicalAddress, phone, contactPersonName, location } = body;
    this._updateOutlet({ outletId, name, physicalAddress, phone, contactPersonName, location }, _ => {
      this.success({ status: "success" });
    });
  }

}