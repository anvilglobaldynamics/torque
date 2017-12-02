
let { Api } = require('./../api-base');
let Joi = require('joi');

exports.AddWarehouseApi = class extends Api {

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

  _createInventories({ warehouseId, organizationId }, cbfn) {
    this._createInventory({ warehouseId, organizationId, type: 'default', name: 'Default' }, () => {
      this._createInventory({ warehouseId, organizationId, type: 'returned', name: 'Returned' }, () => {
        this._createInventory({ warehouseId, organizationId, type: 'damaged', name: 'Damaged' }, () => {
          cbfn();
        })
      })
    })
  }

  _createInventory({ warehouseId, organizationId, type, name }, cbfn) {
    let inventory = {
      inventoryContainerId: warehouseId, organizationId, type, name, allowManualTransfer: true
    }
    this.database.inventory.create(inventory, (err, inventoryId) => {
      if (err) return this.fail(err);
      cbfn();
    })
  }

  handle({ body }) {
    let { name, organizationId, physicalAddress, phone, contactPersonName } = body;
    this._createWarehouse({ name, organizationId, physicalAddress, phone, contactPersonName }, (warehouseId) => {
      this._createInventories({ warehouseId, organizationId }, () => {
        this.success({ status: "success", warehouseId });
      });
    });
  }

}