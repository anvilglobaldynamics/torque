let { Api } = require('./../api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');
let { inventoryCommonMixin } = require('./mixins/inventory-common');

exports.GetOutletApi = class extends collectionCommonMixin(inventoryCommonMixin(Api)) {

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
        select: "organizationId",
        errorCode: "OUTLET_INVALID"
      },
      privileges: [
        "PRIV_VIEW_ALL_OUTLETS"
      ]
    }];
  }

  _getOutlet({ outletId }, cbfn) {
    this.database.outlet.findById({ outletId }, (err, outlet) => {
      if (!this._ensureDoc(err, outlet, "OUTLET_INVALID", "Outlet not found.")) return;
      cbfn(outlet);
    })
  }

  handle({ body }) {
    let { outletId } = body;
    this._getOutlet({ outletId }, (outlet) => {
      this._getInventoriesByInventoryContainer({ inventoryContainerId: outletId }, (defaultInventory, returnedInventory, damagedInventory) => {
        this.success({ outlet, defaultInventory, returnedInventory, damagedInventory });
      })
    });
  }

}