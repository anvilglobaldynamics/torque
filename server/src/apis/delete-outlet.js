
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');

exports.DeleteOutletApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
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
        "PRIV_MODIFY_ALL_OUTLETS"
      ]
    }];
  }

  async __ensureOutletIsEmpty({ outletId }) {
    let inventoryList = await this.database.inventory.listByInventoryContainerId({ inventoryContainerId: outletId, inventoryContainerType: 'outlet' });
    let isEmpty = inventoryList.every(inventory => inventory.productList.length === 0);
    throwOnFalsy(isEmpty, "UNABLE_TO_DELETE_OUTLET", "Unable to delete outlet. The outlet is not empty.");
  }

  async handle({ body }) {
    let { outletId } = body;
    await this.__ensureOutletIsEmpty({ outletId });
    let results = await this.database.outlet.deleteById({ id: outletId });
    throwOnFalsy(results, "UNABLE_TO_DELETE_OUTLET", "Unable to delete outlet.");
    results = await this.database.inventory.deleteAllByInventoryContainerId({ inventoryContainerId: outletId, inventoryContainerType: 'outlet' });
    throwOnFalsy(results, "UNABLE_TO_DELETE_OUTLET", "Unable to delete outlet.");
    return { status: 'success' };
  }

}