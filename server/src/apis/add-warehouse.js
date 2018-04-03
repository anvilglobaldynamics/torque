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
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privileges: [
        "PRIV_MODIFY_ALL_WAREHOUSES"
      ]
    }];
  }

  _createWarehouse({ name, organizationId, physicalAddress, phone, contactPersonName }, cbfn) {
    let warehouse = {
      name, organizationId, physicalAddress, phone, contactPersonName
    }
    this.database.warehouse.create(warehouse, (err, warehouseId) => {
      if (err) return this.fail(err);
      return cbfn(warehouseId);
    });
  }

  handle({ body }) {
    let { name, organizationId, physicalAddress, phone, contactPersonName } = body;
    this._createWarehouse({ name, organizationId, physicalAddress, phone, contactPersonName }, (warehouseId) => {
      this._createStandardInventories({ inventoryContainerId: warehouseId, inventoryContainerType: "warehouse", organizationId }, () => {
        this.success({ status: "success", warehouseId });
      });
    });
  }

}