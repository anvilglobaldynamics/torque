let { Api } = require('./../api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');
let { inventoryCommonMixin } = require('./mixins/inventory-common');

exports.DeleteWarehouseApi = class extends collectionCommonMixin(inventoryCommonMixin(Api)) {

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
        query: ({ warehouseId }) => ({ id: warehouseId }),
        select: "organizationId",
        errorCode: "WAREHOUSE_INVALID"
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
    this._checkIfInventoryContainerIsEmpty({ inventoryContainerId: warehouseId }, _ => {
      this._deleteWarehouse({ warehouseId }, _ => {
        this._deleteByInventoryContainerId({ inventoryContainerId: warehouseId }, _ => {
          this.success({ status: "success" });
        });
      });
    });
  }

}