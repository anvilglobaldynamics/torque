let { Api } = require('./../api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');
let { inventoryCommonMixin } = require('./mixins/inventory-common');

exports.GetWarehouseApi = class extends collectionCommonMixin(inventoryCommonMixin(Api)) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      warehouseId: Joi.number().max(999999999999999).required()
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
        "PRIV_VIEW_ALL_WAREHOUSES"
      ]
    }];
  }

  _getWarehouse({ warehouseId }, cbfn) {
    this.database.warehouse.findById({ warehouseId }, (err, warehouse) => {
      if (!this._ensureDoc(err, warehouse, "WAREHOUSE_INVALID", "Warehouse not found")) return;
      cbfn(warehouse);
    })
  }

  handle({ body }) {
    let { warehouseId } = body;
    this._getWarehouse({ warehouseId }, (warehouse) => {
      this._getInventoriesByInventoryContainer({ inventoryContainerId: warehouseId, inventoryContainerType: "warehouse" }, (defaultInventory, returnedInventory, damagedInventory) => {
        this.success({ warehouse, defaultInventory, returnedInventory, damagedInventory });
      })
    });
  }

}