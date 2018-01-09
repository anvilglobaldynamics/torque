let { Api } = require('./../api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');

exports.DeleteWarehouseApi = class extends collectionCommonMixin(Api) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),
      warehouseId: Joi.number().max(999999999999999).required(),
    });
  }

  get accessControl() {
    return [{
      organizationBy: {
        from: "warehouse",
        query: ({ customerId }) => ({ id: warehouseId }),
        select: "organizationId"
      },
      privileges: [
        "PRIV_MODIFY_ALL_WAREHOUSES"
      ]
    }];
  }

  _deleteWarehouse({ warehouseId }, cbfn) {
    this._deleteDocById(this.database.warehouse, { warehouseId }, cbfn);
  }

  handle({ body, userId }) {
    let { warehouseId } = body;
    this._deleteWarehouse({ warehouseId }, _ => {
      this.success({ status: "success" });
    });
  }

}