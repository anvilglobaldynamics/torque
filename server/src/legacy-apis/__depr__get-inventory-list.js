let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');

exports.GetInventoryListApi = class extends collectionCommonMixin(LegacyApi) {

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
      privilegeList: [
        "PRIV_VIEW_ALL_INVENTORIES"
      ]
    }];
  }

  _getInventoryList({ organizationId }, cbfn) {
    this.legacyDatabase.inventory.listByOrganizationId({ organizationId }, (err, inventoryList) => {
      if (err) return this.fail(err);
      Promise.all(inventoryList.map(inventory => new Promise((accept, reject) => {
        let _cbfn = (err, inventoryContainer) => {
          if (err) return reject(err);
          if (!inventoryContainer) {
            let err = new Error("Could not find Inventory Container");
            err.code = "INVENTORY_CONTAINER_NOT_FOUND";
            this.logger.error(err);
            return reject(err);
          }
          inventory.inventoryContainerName = inventoryContainer.name;
          return accept();
        }
        if (inventory.inventoryContainerType === "outlet") {
          this.legacyDatabase.outlet.findById({ outletId: inventory.inventoryContainerId }, _cbfn);
        } else {
          this.legacyDatabase.warehouse.findById({ warehouseId: inventory.inventoryContainerId }, _cbfn);
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