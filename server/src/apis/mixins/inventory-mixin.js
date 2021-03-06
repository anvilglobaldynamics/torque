const { Api } = require('./../../api-base');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../../utils/coded-error');

/** @param {typeof Api} SuperApiClass */
exports.InventoryMixin = (SuperApiClass) => class extends SuperApiClass {

  async __getInventory({ inventoryId }) {
    let inventory = await this.database.inventory.findById({ id: inventoryId });
    throwOnFalsy(inventory, "INVENTORY_INVALID", "inventory could not be found");
    return inventory;
  }

  async __checkIfInventoryContainsProduct({ inventoryId, productId }) {
    let inventory = await this.__getInventory({ inventoryId });
    let product = inventory.productList.find(product => product.productId === productId);
    throwOnFalsy(product, "PRODUCT_NOT_IN_INVENTORY", "product is not in this inventory");
    return;
  }

  async __getOutletDefaultInventory({ outletId }) {
    let inventoryList = await this.database.inventory.listByInventoryContainerId({ inventoryContainerId: outletId, inventoryContainerType: 'outlet' });
    throwOnFalsy(inventoryList.length, "OUTLET_INVENTORY_INVALID", "Invalid Outlet Or Inventory could not be found");
    let outletDefaultInventory = inventoryList.find(inventory => inventory.type === 'default');
    return outletDefaultInventory;
  }

  async __getWarehouseDefaultInventory({ warehouseId }) {
    let inventoryList = await this.database.inventory.listByInventoryContainerId({ inventoryContainerId: warehouseId, inventoryContainerType: 'warehouse' });
    throwOnFalsy(inventoryList.length, "WAREHOUSE_INVENTORY_INVALID", "Invalid Warehouse Or Inventory could not be found");
    let warehouseDefaultInventory = inventoryList.find(inventory => inventory.type === 'default');
    return warehouseDefaultInventory;
  }

  async __getOutletReturnedInventory({ outletId }) {
    let inventoryList = await this.database.inventory.listByInventoryContainerId({ inventoryContainerId: outletId, inventoryContainerType: 'outlet' });
    throwOnFalsy(inventoryList.length, "OUTLET_INVENTORY_INVALID", "Invalid Outlet Or Inventory could not be found");
    let outletReturnedInventory = inventoryList.find(inventory => inventory.type === 'returned');
    return outletReturnedInventory;
  }

  async __getWarehouseReturnedInventory({ warehouseId }) {
    let inventoryList = await this.database.inventory.listByInventoryContainerId({ inventoryContainerId: warehouseId, inventoryContainerType: 'warehouse' });
    throwOnFalsy(inventoryList.length, "WAREHOUSE_INVENTORY_INVALID", "Invalid Warehouse Or Inventory could not be found");
    let warehouseReturnedInventory = inventoryList.find(inventory => inventory.type === 'returned');
    return warehouseReturnedInventory;
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

  async __getAggregatedProductListWithoutAcquisitionDetails({ productList }) {
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
      sourceKeyFn: (doc => doc.product.productBlueprintId),
      target: 'productBlueprint',
      onError: (product) => { throw new CodedError("PRODUCT_BLUEPRINT_INVALID", "Invalid ProductBlueprint"); }
    })).forEach((productBlueprint, _product) => {
      _product.product.productBlueprint = productBlueprint;
    });
  }

  async __getAggregatedProductList({ productList }) {
    await this.__getAggregatedProductListWithoutAcquisitionDetails({ productList });
    return productList;
  }

  async __createInventory({ inventoryContainerId, inventoryContainerType, organizationId, type, name }) {
    let inventory = {
      inventoryContainerId, inventoryContainerType, organizationId, type, name
    }
    return await this.database.inventory.create(inventory);
  }

  async __createStandardInventories({ inventoryContainerId, inventoryContainerType, organizationId }) {
    await this.__createInventory({ inventoryContainerId, inventoryContainerType, organizationId, type: 'default', name: 'Default' });
    await this.__createInventory({ inventoryContainerId, inventoryContainerType, organizationId, type: 'returned', name: 'Returned' });
    await this.__createInventory({ inventoryContainerId, inventoryContainerType, organizationId, type: 'damaged', name: 'Damaged' });
  }

  async _pushProductOrIncrementCount({ productId, count, inventoryId }) {
    let inventory = await this.database.inventory.findById({ id: inventoryId });
    let inventoryProduct = inventory.productList.find(inventoryProduct => inventoryProduct.productId === productId);

    if (inventoryProduct) {
      this.ensureUpdate('inventory', await this.database.inventory.increaseProductCount({ id: inventoryId, productId }, { count }));
    } else {
      this.ensureUpdate('inventory', await this.database.inventory.pushProduct({ id: inventoryId }, { productId, count }));
    }
  }

  // Add Product To Inventory - Start

  async _findOrCreateProduct({ productBlueprintId }) {
    let product = await this.database.product.findByProductBlueprintId({ productBlueprintId });
    if (!product) {
      let productBlueprint = await this.database.productBlueprint.findById({ id: productBlueprintId });
      let purchasePrice = productBlueprint.defaultPurchasePrice;
      let salePrice = productBlueprint.defaultSalePrice;
      await this.database.product.create({ originApp: this.clientApplication, productBlueprintId, purchasePrice, salePrice });
      product = await this.database.product.findByProductBlueprintId({ productBlueprintId });
    }
    throwOnFalsy(product, "PRODUCT_NOT_FOUND", "Product could not be found");
    return product;
  }

  async _addProductToInventory({ inventoryId, productList }) {
    let insertedProductList = [];

    await Promise.all(productList.map(async product => {
      let { productBlueprintId, count } = product;

      let { id: productId } = await this._findOrCreateProduct({ productBlueprintId });
      await this._pushProductOrIncrementCount({ productId, count, inventoryId });
      await insertedProductList.push({ productId, count });
    }));
    return insertedProductList;
  }

  async _addAcquisitionRecord({ createdByUserId, acquiredDatetimeStamp, inventoryId, productList, vendorId, organizationId }) {
    return await this.database.productAcquisition.create({ originApp: this.clientApplication, createdByUserId, acquiredDatetimeStamp, inventoryId, productList: productList, vendorId, organizationId });
  }

  // Add Product To Inventory - End

}