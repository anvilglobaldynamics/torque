
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');

exports.GetAggregatedInventoryDetailsApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get autoPaginates() { return ['aggregatedProductList']; }

  get requestSchema() {
    return Joi.object().keys({
      inventoryIdList: Joi.array().items(
        Joi.number().max(999999999999999).required()
      ),
      searchString: Joi.string().min(0).max(64).allow('').optional()
    });
  }

  // get accessControl() {
  //   return [{
  //     organizationBy: (self, userId, body) => {
  //       errorCode: "INVENTORY_INVALID"
  //     },
  //     privileges: [
  //       "PRIV_VIEW_ALL_INVENTORIES"
  //     ]
  //   }];
  // }

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

  async __getAggregatedProductList({ productList }) {
    (await this.crossmap({
      source: productList,
      sourceKey: 'productId',
      target: 'product',
      onError: (product) => { throw new CodedError("PRODUCT_INVALID", "Invalid Product"); }
    })).forEach((product, _product) => {
      _product.product = product;
    });
    (await this.crossmap({
      source: productList,
      sourceKeyFn: (doc => doc.product.productCategoryId),
      target: 'productCategory',
      onError: (product) => { throw new CodedError("PRODUCT_CATEGORY_INVALID", "Invalid ProductCategory"); }
    })).forEach((productCategory, _product) => {
      _product.product.productCategory = productCategory;
    });
    let productAcquisitionList = await this.database.productAcquisition.listByProductIdList({ productIdList: productList.map(product => product.productId) });
    productList.forEach(product => {
      let productAcquisition = productAcquisitionList.find(productAcquisition =>
        productAcquisition.productList.find(_product => _product.productId === product.productId)
      );
      if (productAcquisition) {
        product.acquiredDatetimeStamp = productAcquisition.acquiredDatetimeStamp;
        product.addedDatetimeStamp = productAcquisition.acquiredDatetimeStamp; // because if not transferred, acquired date is date added
      } else {
        product.acquiredDatetimeStamp = 1514821590000;
        product.addedDatetimeStamp = 1514821590000;
      }
    });
    let productTransferList = await this.database.productTransfer.listByProductIdList({ productIdList: productList.map(product => product.productId) });
    productList.forEach(product => {
      let productTransfer = productTransferList.find(productTransfer =>
        productTransfer.productList.find(_product => _product.productId === product.productId)
      );
      if (productTransfer) {
        product.addedDatetimeStamp = productTransfer.transferredDatetimeStamp;
      }
    });
    return productList;
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
    for(let i=0; i<inventoryIdList.length; i++ ) {
      let aggregatedInventoryDetails = await this.__getAggregatedInventoryDetails({ inventoryId: inventoryIdList[i], searchString});
      aggregatedInventoryDetailsList.push(aggregatedInventoryDetails);
    }

    aggregatedInventoryDetailsList.sort((a, b) => {
      return b.inventoryDetails.inventoryId - a.inventoryDetails.inventoryId;
    });

    return { aggregatedInventoryDetailsList };
  }

}