
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');

exports.AdminFindOrganizationApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get authenticationLevel() { return 'admin'; }

  get requestSchema() {
    return Joi.object().keys({
      apiKey: Joi.string().length(64).required(),
      emailOrPhone: Joi.alternatives([
        Joi.string().email().min(3).max(30), // if email
        Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15) // if phone
      ]).required()
    });
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
    console.log("in handle with: ", body);
    let { organizationId } = body;
    // let inventoryList = await this.__getInventoryList({ organizationId });
    return { "flag": true };
  }

}