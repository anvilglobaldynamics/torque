let { Api } = require('./../api-base');
let Joi = require('joi');

exports.GetOutletApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      outletId: Joi.number().max(999999999999999).required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: {
        from: "outlet",
        query: ({ outletId }) => ({ id: outletId }),
        select: "organizationId"
      },
      privileges: [
        "PRIV_VIEW_ALL_OUTLETS"
      ]
    }];
  }

  _getOutlet(outletId, cbfn) {
    this.database.outlet.findById({ outletId }, (err, outlet) => {
      if (err) return this.fail(err);
      if (outlet === null) {
        err = new Error("outlet not found");
        err.code = "OUTLET_INVALID";
        return this.fail(err);
      }
      cbfn(outlet);
    })
  }

  _getOutletInventories(outletId, cbfn) {
    this.database.inventory.listByInventoryContainerId({ inventoryContainerId: outletId }, (err, inventoryList) => {
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
    let { outletId } = body;
    this._getOutlet(outletId, (outlet) => {
      this._getOutletInventories(outletId, (defaultInventory, returnedInventory, damagedInventory) => {
        this.success({ outlet, defaultInventory, returnedInventory, damagedInventory });
      })
    });
  }

}