const { Api } = require('./../../api-base');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../../utils/coded-error');

/** @param {typeof Api} SuperApiClass */
exports.InventoryMixin = (SuperApiClass) => class extends SuperApiClass {

  async __getInventory({ inventoryId }) {
    let doc = await this.database.inventory.findById({ id: inventoryId });
    throwOnFalsy(doc, "INVENTORY_INVALID", "inventory could not be found");
    return doc;
  }

  async __getOutletDefaultInventory({ outletId }) {
    let inventoryList = await this.database.inventory.listByInventoryContainerId({ inventoryContainerId: outletId, inventoryContainerType: 'outlet' });
    throwOnFalsy(inventoryList.length, "OUTLET_INVENTORY_INVALID", "Invalid Outlet Or Inventory could not be found");
    let outletDefaultInventory = inventoryList.find(inventory => inventory.type === 'default');
    return outletDefaultInventory;
  }

  async __getOutletReturnedInventory({ outletId }) {
    let inventoryList = await this.database.inventory.listByInventoryContainerId({ inventoryContainerId: outletId, inventoryContainerType: 'outlet' });
    throwOnFalsy(inventoryList.length, "OUTLET_INVENTORY_INVALID", "Invalid Outlet Or Inventory could not be found");
    let outletReturnedInventory = inventoryList.find(inventory => inventory.type === 'returned');
    return outletReturnedInventory;
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

}