let { Api } = require('./../api-base');
let Joi = require('joi');

exports.AddOutletApi = class extends Api {

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

  _createOutlet({ name, organizationId, physicalAddress, phone, contactPersonName }, cbfn) {
    let outlet = {
      name, organizationId, physicalAddress, phone, contactPersonName
    }
    this.database.outlet.create(outlet, (err, outletId) => {
      if (err) {
        if ('code' in err && err.code === 'DUPLICATE_phone') {
          err = new Error("Provided phone number is already in use");
          err.code = 'PHONE_ALREADY_IN_USE';
        }
        return this.fail(err);
      }
      return cbfn(outletId);
    });
  }

  _createInventories({ outletId, organizationId }, cbfn) {
    this._createInventory({ outletId, organizationId, type: 'default', name: 'Default' }, () => {
      this._createInventory({ outletId, organizationId, type: 'returned', name: 'Returned' }, () => {
        this._createInventory({ outletId, organizationId, type: 'damaged', name: 'Damaged' }, () => {
          cbfn();
        })
      })
    })
  }

  _createInventory({ outletId, organizationId, type, name }, cbfn) {
    let inventory = {
      inventoryContainerId: outletId, organizationId, type, name, allowManualTransfer: true
    }
    this.database.inventory.create(inventory, (err, inventoryId) => {
      if (err) return this.fail(err);
      cbfn();
    })
  }

  handle({ body }) {
    let { name, organizationId, physicalAddress, phone, contactPersonName } = body;
    this._createOutlet({ name, organizationId, physicalAddress, phone, contactPersonName }, (outletId) => {
      this._createInventories({ outletId, organizationId }, () => {
        this.success({ status: "success", outletId });
      });
    });
  }

}