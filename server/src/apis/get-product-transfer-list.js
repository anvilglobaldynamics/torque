
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { InventoryMixin } = require('./mixins/inventory-mixin');

exports.GetProductTransferListApi = class extends Api.mixin(InventoryMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get autoPaginates() { return ['productTransferList']; }

  get requestSchema() {
    return Joi.object().keys({

      organizationId: Joi.number().max(999999999999999).required(),

      fromDate: Joi.number().max(999999999999999).required(),
      toDate: Joi.number().max(999999999999999).required(),
      vendorId: Joi.number().max(999999999999999).allow(null).required(),

      searchString: Joi.string().min(0).max(64).allow('').optional()
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privilegeList: [
        "PRIV_VIEW_ALL_INVENTORIES"
      ],
      moduleList: [
        "MOD_PRODUCT",
      ]
    }];
  }

  __getExtendedToDate(toDate) {
    toDate = new Date(toDate);
    toDate.setHours(23);
    toDate.setMinutes(59);
    toDate = toDate.getTime();
    return toDate;
  }

  async __getProductTransferList({ organizationId, fromDate, toDate, vendorId, searchString }) {
    let productTransferList = await this.database.productTransfer.listByFilters({ organizationId, fromDate, toDate, vendorId, searchString });
    return productTransferList;
  }

  async __includeExtendedInformation({ productTransferList }) {
    // get createdByUser
    let map = await this.crossmap({
      source: productTransferList,
      sourceKey: 'createdByUserId',
      target: 'user'
    });
    map.forEach((user, productTransfer) => {
      productTransfer.createdByUser = extract(user, [
        'id',
        'fullName',
        'email',
        'phone',
      ])
    });

    // get product and productBlueprint
    let productList = productTransferList.reduce(((productList, productTransfer) => productList.concat(productTransfer.productList)), []);
    map = await this.crossmap({
      source: productList,
      sourceKey: 'productId',
      target: 'product'
    });
    map.forEach((product, soldProduct) => soldProduct.product = product);
    map = await this.crossmap({
      source: productList,
      sourceKeyFn: (soldProduct) => soldProduct.product.productBlueprintId,
      target: 'productBlueprint'
    });
    map.forEach((productBlueprint, soldProduct) => soldProduct.productBlueprint = productBlueprint);

    // get fromInventory
    map = await this.crossmap({
      source: productTransferList,
      sourceKey: 'fromInventoryId',
      target: 'inventory'
    });
    map.forEach((fromInventory, productTransfer) => {
      delete fromInventory['productList'];
      productTransfer.fromInventory = fromInventory
    });

    // get toInventory
    map = await this.crossmap({
      source: productTransferList,
      sourceKey: 'toInventoryId',
      target: 'inventory'
    });
    map.forEach((toInventory, productTransfer) => {
      delete toInventory['productList'];
      productTransfer.toInventory = toInventory
    });

    // get vendor
    productTransferList.forEach(productTransfer => {
      productTransfer.vendor = null;
    });
    let productTransferListWithVendor = productTransferList.filter(productTransfer => productTransfer.vendorId !== null);
    map = await this.crossmap({
      source: productTransferListWithVendor,
      sourceKey: 'vendorId',
      target: 'vendor'
    });
    map.forEach((vendor, productTransfer) => {
      productTransfer.vendor = vendor
    });

    // append inventory container details to inventories
    let inventoryList = [].concat(
      productTransferList.map(productTransfer => productTransfer.toInventory),
      productTransferList.map(productTransfer => productTransfer.fromInventory),
    );
    let outletInventoryList = inventoryList.filter(inventory => inventory.inventoryContainerType === 'outlet');
    let warehouseInventoryList = inventoryList.filter(inventory => inventory.inventoryContainerType === 'warehouse');

    map = await this.crossmap({
      source: outletInventoryList,
      sourceKey: 'inventoryContainerId',
      target: 'outlet'
    });
    map.forEach((outlet, inventory) => inventory.inventoryContainer = outlet);

    map = await this.crossmap({
      source: warehouseInventoryList,
      sourceKey: 'inventoryContainerId',
      target: 'warehouse'
    });
    map.forEach((warehouse, inventory) => inventory.inventoryContainer = warehouse);
  }

  async handle({ body }) {
    let { organizationId, fromDate, toDate, vendorId, searchString } = body;
    toDate = this.__getExtendedToDate(toDate);
    let productTransferList = await this.__getProductTransferList({ organizationId, fromDate, toDate, vendorId, searchString });
    await this.__includeExtendedInformation({ productTransferList });
    return { productTransferList };
  }

}