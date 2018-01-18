let { Api } = require('./../api-base');
let Joi = require('joi');

let { inventoryCommonMixin } = require('./mixins/inventory-common');

exports.AddOutletApi = class extends inventoryCommonMixin(Api) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      name: Joi.string().min(1).max(64).required(),
      organizationId: Joi.number().max(999999999999999).required(),
      physicalAddress: Joi.string().min(1).max(128).required(),
      contactPersonName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().alphanum().min(11).max(14).required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privileges: [
        "PRIV_MODIFY_ALL_OUTLETS"
      ]
    }];
  }

  _createOutlet({ name, organizationId, physicalAddress, phone, contactPersonName }, cbfn) {
    let outlet = {
      name, organizationId, physicalAddress, phone, contactPersonName
    }
    this.database.outlet.create(outlet, (err, outletId) => {
      if (err) {
        if ('code' in err && err.code === 'DUPLICATE_phone') {
          err = new Error("Provided phone number is already in use");
          err.code = 'PHONE_ALREADY_IN_USE';
        }
        return this.fail(err);
      }
      return cbfn(outletId);
    });
  }

  handle({ body }) {
    let { name, organizationId, physicalAddress, phone, contactPersonName } = body;
    this._createOutlet({ name, organizationId, physicalAddress, phone, contactPersonName }, (outletId) => {
      this._createStandardInventories({ inventoryContainerId: outletId, organizationId }, () => {
        this.success({ status: "success", outletId });
      });
    });
  }

}