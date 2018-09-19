
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { InventoryMixin } = require('./mixins/inventory-mixin');

exports.GetAggregatedInventoryDetailsApi = class extends Api.mixin(InventoryMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get autoPaginates() { return ['aggregatedProductList']; }

  get requestSchema() {
    return Joi.object().keys({
      inventoryId: Joi.number().max(999999999999999).required(),
      searchString: Joi.string().min(0).max(64).allow('').optional()
    });
  }

  get accessControl() {
    return [{
      organizationBy: {
        from: "inventory",
        query: ({ inventoryId }) => ({ id: inventoryId }),
        select: "organizationId",
        errorCode: "INVENTORY_INVALID"
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

  async handle({ body }) {
    let { inventoryId, searchString } = body;
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
        inventoryName: inventory.name
      },
      inventoryContainerDetails,
      aggregatedProductList
    };
  }

}