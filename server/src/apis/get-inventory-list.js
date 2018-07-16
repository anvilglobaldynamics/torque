
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { generateRandomString } = require('./../utils/random-string');

exports.GetInventoryListApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
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

  async __getInventoryList({ organizationId }) {
    let combinedInventoryList = await this.database.inventory.listByOrganizationId(organizationId);
    {
      let inventoryList = combinedInventoryList.filter(inventory => inventory.inventoryContainerType === 'outlet');
      let map = await this.crossmap({
        source: inventoryList,
        sourceKey: 'inventoryContainerId',
        target: 'outlet',
        onError: (inventory) => { throw new CodedError("INVENTORY_CONTAINER_NOT_FOUND", "Could not find Inventory Container"); }
      });




    }
  }

  async handle({ body }) {
    let { organizationId } = body;
    let inventoryList = await this.__getInventoryList({ organizationId });
    return { inventoryList };
  }

}