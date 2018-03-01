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
      Promise.all(inventoryList.map(inventory => new Promise((accept, reject) => {
        let _cbfn = (err, inventoryContainer) => {
          if (err) return reject(err);
          inventory.inventoryContainerName = inventoryContainer.name;
          accept();
        }
        if (inventory.inventoryContainerType === "outlet") {
          this.database.outlet.findById({ outletId: inventory.inventoryContainerId }, _cbfn);
        } else {
          this.database.warehouse.findById({ warehouseId: inventory.inventoryContainerId }, _cbfn);
        }
      }))).catch(ex => {
        return this.fail(ex);
      }).then(() => {
        cbfn(inventoryList);
      })
    })
  }

  handle({ body }) {
    let { organizationId } = body;
    this._getInventoryList({ organizationId }, (inventoryList) => {
      this.success({ inventoryList });
    });
  }

}