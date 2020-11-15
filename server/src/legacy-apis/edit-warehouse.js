let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');

exports.EditWarehouseApi = class extends collectionCommonMixin(LegacyApi) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),
      warehouseId: Joi.number().max(999999999999999).required(),

      name: Joi.string().min(1).max(64).required(),
      physicalAddress: Joi.string().min(1).max(128).required(),
      phone: Joi.string().min(1).max(64).required(), // is actually an arbitrary string, not just a phone number
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
      privilegeList: [
        "PRIV_MODIFY_ALL_WAREHOUSES"
      ],
      moduleList: [
        "MOD_PRODUCT",
      ]
    }];
  }

  _updateWarehouse({ warehouseId, name, physicalAddress, phone, contactPersonName }, cbfn) {
    this.legacyDatabase.warehouse.update({ warehouseId }, { name, physicalAddress, phone, contactPersonName }, (err, wasUpdated) => {
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