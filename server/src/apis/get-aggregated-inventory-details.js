
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
      searchString: Joi.string().min(0).max(64).allow('').optional(),
      identifierCode: Joi.string().min(0).max(64).allow('').optional(),
      includeZeroCountProducts: Joi.boolean().default(true).optional(),
      sortOrder: Joi.string().default('id-ascending').valid('id-ascending', 'date-added-ascending').optional()
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
      privilegeList: [
        "PRIV_VIEW_ALL_INVENTORIES"
      ],
      moduleList: [
        "MOD_PRODUCT",
      ]
    }];
  }

  __searchAggregatedProductList({ aggregatedProductList, searchString }) {
    aggregatedProductList = aggregatedProductList.filter(aggregatedProduct => {
      searchString = this.escapeRegExp(searchString.toLowerCase());
      let regex = new RegExp(searchString, 'gi');
      return regex.test(aggregatedProduct.product.productBlueprint.name);
    });
    return aggregatedProductList;
  }

  __removeZeroCountProducts({ aggregatedProductList }) {
    return aggregatedProductList.filter(aggregatedProduct => aggregatedProduct.count > 0);
  }

  __filterAggregatedProductListWithIdentifierCode({ aggregatedProductList, identifierCode }) {
    aggregatedProductList = aggregatedProductList.filter(aggregatedProduct => {
      return (aggregatedProduct.product.productBlueprint.identifierCode === identifierCode);
    });
    return aggregatedProductList;
  }

  async handle({ body }) {
    let { inventoryId, searchString, includeZeroCountProducts, identifierCode, sortOrder } = body;
    let inventory = await this.__getInventory({ inventoryId });
    let inventoryContainerDetails = await this.__getInventoryContainerDetails({ inventory });
    let productList = inventory.productList;

    let clonedProductList = JSON.parse(JSON.stringify(productList));
    let aggregatedProductList = await this.__getAggregatedProductList({ productList: clonedProductList });

    if (searchString) {
      aggregatedProductList = this.__searchAggregatedProductList({ aggregatedProductList, searchString });
    }

    if (!includeZeroCountProducts) {
      aggregatedProductList = this.__removeZeroCountProducts({ aggregatedProductList });
    }

    if (identifierCode) {
      aggregatedProductList = this.__filterAggregatedProductListWithIdentifierCode({ aggregatedProductList, identifierCode });
    }

    if (sortOrder === 'date-added-ascending') {
      aggregatedProductList.sort((a, b) => a.addedDatetimeStamp - b.addedDatetimeStamp);
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