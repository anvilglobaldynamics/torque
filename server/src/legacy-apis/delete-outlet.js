let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');
let { inventoryCommonMixin } = require('./mixins/inventory-common');

exports.DeleteOutletApi = class extends collectionCommonMixin(inventoryCommonMixin(LegacyApi)) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),
      outletId: Joi.number().max(999999999999999).required(),
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
        "PRIV_MODIFY_ALL_OUTLETS"
      ]
    }];
  }

  _deleteOutlet({ outletId }, cbfn) {
    this._deleteDocById(this.legacyDatabase.outlet, { outletId }, cbfn);
  }

  handle({ body, userId }) {
    let { outletId } = body;
    this._checkIfInventoryContainerIsEmpty({ inventoryContainerId: outletId }, _ => {
      this._deleteOutlet({ outletId }, _ => {
        this._deleteByInventoryContainerId({ inventoryContainerId: outletId }, _ => {
          this.success({ status: "success" });
        });
      });
    });
  }

}