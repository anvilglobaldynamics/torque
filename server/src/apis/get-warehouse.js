let { Api } = require('./../api-base');
let Joi = require('joi');

exports.GetWarehouseApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      warehouseId: Joi.number().max(999999999999999).required()
    });
  }

  _getWarehouse(warehouseId, cbfn) {
    this.database.warehouse.getByWarehouseId(warehouseId, (err, warehouse) => {
      if (err) return this.fail(err);
      cbfn(warehouse);
    })
  }

  _getWarehouseInventories(warehouseId, cbfn) {
    this.database.inventory.listByInventoryContainerId(warehouseId, (err, inventoryList) => {
      let defaultInventory, returnedInventory, damagedInventory;
      inventoryList.forEach(inventory => {
        if (inventory.type === 'default') {
          let { createdDatetimeStamp, lastModifiedDatetimeStamp, id, name, allowManualTransfer } = inventory;
          defaultInventory = { createdDatetimeStamp, lastModifiedDatetimeStamp, id, name, allowManualTransfer };
        } else if (inventory.type === 'returned') {
          let { createdDatetimeStamp, lastModifiedDatetimeStamp, id, name, allowManualTransfer } = inventory;
          returnedInventory = { createdDatetimeStamp, lastModifiedDatetimeStamp, id, name, allowManualTransfer };
        } else if (inventory.type === 'damaged') {
          let { createdDatetimeStamp, lastModifiedDatetimeStamp, id, name, allowManualTransfer } = inventory;
          damagedInventory = { createdDatetimeStamp, lastModifiedDatetimeStamp, id, name, allowManualTransfer };
        }
      });
      cbfn(defaultInventory, returnedInventory, damagedInventory);
    })
  }

  handle({ body }) {
    let { warehouseId } =  body;
    this._getWarehouse(warehouseId, (warehouse) => {
      this._getWarehouseInventories(warehouseId, (defaultInventory, returnedInventory, damagedInventory) => {
        this.success({ warehouse, defaultInventory, returnedInventory, damagedInventory });
      })
    });
  }

}