let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

exports.GetWarehouseListApi = class extends LegacyApi {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get autoPaginates() { return ['warehouseList']; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      organizationId: Joi.number().max(999999999999999).required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privilegeList: [
        "PRIV_VIEW_ALL_WAREHOUSES"
      ],
      moduleList: [
        "MOD_PRODUCT",
      ]
    }];
  }

  _getWarehouseList({ organizationId }, cbfn) {
    this.legacyDatabase.warehouse.listByOrganizationId({ organizationId }, (err, warehouseList) => {
      if (err) return this.fail(err);
      cbfn(warehouseList);
    })
  }

  handle({ body }) {
    let { organizationId } = body;
    this._getWarehouseList({ organizationId }, (warehouseList) => {
      this.success({ warehouseList });
    });
  }

}