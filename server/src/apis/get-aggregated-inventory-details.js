
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');

exports.GetAggregatedInventoryDetailsApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      inventoryId: Joi.number().max(999999999999999).required()
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

  async __getInventory({ inventoryId }) {
    let doc = await this.database.inventory.findById({ id: inventoryId });
    throwOnFalsy(doc, "INVENTORY_INVALID", "inventory could not be found");
    return doc;
  }

  async __getInventoryContainerDetails({ inventory }) {
    let inventoryContainer;
    if (inventory.inventoryContainerType === "outlet") {
      inventoryContainer = await this.database.outlet.findById({ id: inventory.inventoryContainerId });
    } else {
      inventoryContainer = await this.database.warehouse.findById({ id: inventory.inventoryContainerId });
    }
    throwOnFalsy(inventoryContainer, "INVENTORY_CONTAINER_INVALID", "inventory container could not be found");
    return {
      inventoryContainerId: inventory.inventoryContainerId,
      inventoryContainerType: inventory.inventoryContainerType,
      inventoryContainerName: inventoryContainer.name
    }
  }

  // async __getMatchingProductList({ productList }) {
  //   (await this.crossmap({
  //     source: productList,
  //     sourceKey: 'productId',
  //     target: 'product',
  //     onError: (product) => { throw new CodedError("PRODUCT_INVALID", "Invalid Product"); }
  //   })).forEach((product, _product) => {
  //     _product.product = product;
  //   });
  // }

  async __getMatchingProductList({ productList }) {
    let productIdList = productList.map(product => product.productId);
    return await this.database.product.listByIdList({ idList: productIdList });
  }

  async __getMatchingProductCategoryList({ matchingProductList }) {
    let productCategoryIdList = matchingProductList.map(product => product.productCategoryId);
    return await this.database.productCategory.listByIdList({ idList: productCategoryIdList });
  }

  async handle({ body }) {
    let { inventoryId } = body;
    let inventory = await this.__getInventory({ inventoryId });
    let inventoryContainerDetails = await this.__getInventoryContainerDetails({ inventory });
    let productList = inventory.productList;
    let matchingProductList = await this.__getMatchingProductList({ productList });
    let matchingProductCategoryList = await this.__getMatchingProductCategoryList({ matchingProductList });

    return {
      status: "success",
      inventoryDetails: {
        inventoryName: inventory.name
      },
      inventoryContainerDetails,
      productList,
      matchingProductList,
      matchingProductCategoryList
    };
  }

}