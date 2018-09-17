const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { InventoryMixin } = require('./mixins/inventory-mixin');

exports.ReportInventoryDetailsApi = class extends Api.mixin(InventoryMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      inventoryIdList: Joi.array().items(
        Joi.number().max(999999999999999).required()
      ),
      searchString: Joi.string().min(0).max(64).allow('').optional()
    });
  }

  get accessControl() {
    return [{
      organizationBy: async (userId, body) => {
        let inventoryList = await this.database.inventory.listByIdList({ idList: body.inventoryIdList });
        let map = {};
        inventoryList.forEach(inventory => map[inventory.organizationId] = null);
        if (Object.keys(map).length !== 1) {
          throw new CodedError("INVENTORY_INVALID", "inventory could not be found");
        }
        let organizationId = parseInt(Object.keys(map)[0]);
        let organization = await this.database.organization.findById({ id: organizationId });
        return organization;
      },
      privileges: [
        "PRIV_VIEW_ALL_INVENTORIES"
      ]
    }];
  }

  async __searchAggregatedProductList({ aggregatedProductList, searchString }) {
    aggregatedProductList = aggregatedProductList.filter(aggregatedProduct => {
      let regex = new RegExp(searchString, 'g');
      return regex.test(aggregatedProduct.product.productCategory.name);
    });

    return aggregatedProductList;
  }

  async __getAggregatedInventoryDetails({ inventoryId, searchString }) {
    let inventory = await this.__getInventory({ inventoryId });
    let inventoryContainerDetails = await this.__getInventoryContainerDetails({ inventory });
    let productList = inventory.productList;

    let clonedProductList = JSON.parse(JSON.stringify(productList));
    let aggregatedProductList = await this.__getAggregatedProductList({ productList: clonedProductList });

    if (searchString) {
      aggregatedProductList = await this.__searchAggregatedProductList({ aggregatedProductList, searchString });
    }

    return {
      inventoryDetails: {
        inventoryName: inventory.name,
        inventoryId: inventory.id
      },
      inventoryContainerDetails,
      aggregatedProductList
    };
  }

  async handle({ body }) {
    let { inventoryIdList, searchString } = body;

    let aggregatedInventoryDetailsList = [];

    let promiseList = inventoryIdList.map(async (inventoryId) => {
      let aggregatedInventoryDetails = await this.__getAggregatedInventoryDetails({ inventoryId, searchString });
      aggregatedInventoryDetailsList.push(aggregatedInventoryDetails);
    });
    await Promise.all(promiseList);

    aggregatedInventoryDetailsList.sort((a, b) => {
      return inventoryIdList.indexOf(a.inventoryDetails.inventoryId) - inventoryIdList.indexOf(b.inventoryDetails.inventoryId);
    });

    return { aggregatedInventoryDetailsList };
  }

}