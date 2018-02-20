let { Api } = require('./../api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');

exports.GetInventoryListApi = class extends collectionCommonMixin(Api) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      organizationId: Joi.number().max(999999999999999).required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privileges: [
        "PRIV_VIEW_ALL_INVENTORIES"
      ]
    }];
  }

  _getInventoryList({ organizationId }, cbfn) {
    this.database.inventory.listByOrganizationId({ organizationId }, (err, inventoryList) => {
      if (err) return this.fail(err);
      cbfn(inventoryList);
    })
  }

  handle({ body }) {
    let { organizationId } = body;
    this._getInventoryList({ organizationId }, (inventoryList) => {
      this.success({ inventoryList });
    });
  }

}