let { Api } = require('./../api-base');
let Joi = require('joi');

let { inventoryCommonMixin } = require('./mixins/inventory-common');

exports.AddWarehouseApi = class extends inventoryCommonMixin(Api) {

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

  _createWarehouse({ name, organizationId, physicalAddress, phone, contactPersonName }, cbfn) {
    let warehouse = {
      name, organizationId, physicalAddress, phone, contactPersonName
    }
    this.database.warehouse.create(warehouse, (err, warehouseId) => {
      if (err) {
        if ('code' in err && err.code === 'DUPLICATE_phone') {
          err = new Error("Provided phone number is already in use");
          err.code = 'PHONE_ALREADY_IN_USE';
        }
        return this.fail(err);
      }
      return cbfn(warehouseId);
    });
  }

  handle({ body }) {
    let { name, organizationId, physicalAddress, phone, contactPersonName } = body;
    this._createWarehouse({ name, organizationId, physicalAddress, phone, contactPersonName }, (warehouseId) => {
      this._createStandardInventories({ inventoryContainerId: warehouseId, organizationId }, () => {
        this.success({ status: "success", warehouseId });
      });
    });
  }

}