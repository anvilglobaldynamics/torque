
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');

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
      privilegeList: [
        "PRIV_VIEW_ALL_INVENTORIES"
      ]
    }];
  }

  async __getInventoryList({ organizationId }) {
    let inventoryList = await this.database.inventory.listByOrganizationId({ organizationId });
    let map = await this.crossmap({
      source: inventoryList.filter(inventory => inventory.inventoryContainerType === 'outlet'),
      sourceKey: 'inventoryContainerId',
      target: 'outlet',
      onError: (inventory) => { throw new CodedError("INVENTORY_CONTAINER_NOT_FOUND", "Could not find Inventory Container"); }
    });
    await this.crossmap({
      source: inventoryList.filter(inventory => inventory.inventoryContainerType === 'warehouse'),
      sourceKey: 'inventoryContainerId',
      target: 'warehouse',
      onError: (inventory) => { throw new CodedError("INVENTORY_CONTAINER_NOT_FOUND", "Could not find Inventory Container"); },
      reuseMap: map
    });
    inventoryList.forEach(inventory => inventory.inventoryContainerName = map.get(inventory).name);
    return inventoryList;
  }

  async handle({ body }) {
    let { organizationId } = body;
    let inventoryList = await this.__getInventoryList({ organizationId });
    return { inventoryList };
  }

}