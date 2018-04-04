let { Api } = require('./../api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');

exports.EditWarehouseApi = class extends collectionCommonMixin(Api) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),
      warehouseId: Joi.number().max(999999999999999).required(),

      name: Joi.string().min(1).max(64).required(),
      physicalAddress: Joi.string().min(1).max(128).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required(),
      contactPersonName: Joi.string().min(1).max(64).required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: {
        from: "warehouse",
        query: ({ warehouseId }) => ({ id: warehouseId }),
        select: "organizationId",
        errorCode: "WAREHOUSE_INVALID"
      },
      privileges: [
        "PRIV_MODIFY_ALL_WAREHOUSES"
      ]
    }];
  }

  _updateWarehouse({ warehouseId, name, physicalAddress, phone, contactPersonName }, cbfn) {
    this.database.warehouse.update({ warehouseId }, { name, physicalAddress, phone, contactPersonName }, (err, wasUpdated) => {
      if (!this._ensureUpdate(err, wasUpdated, "warehouse")) return;
      return cbfn();
    });
  }

  handle({ body, userId }) {
    let { warehouseId, name, physicalAddress, phone, contactPersonName } = body;
    this._updateWarehouse({ warehouseId, name, physicalAddress, phone, contactPersonName }, () => {
      this.success({ status: "success" });
    });
  }

}