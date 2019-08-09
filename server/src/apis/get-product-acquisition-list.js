
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { InventoryMixin } = require('./mixins/inventory-mixin');

exports.GetProductAcquisitionListApi = class extends Api.mixin(InventoryMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get autoPaginates() { return ['productAcquisitionList']; }

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

  async __getProductAcquisitionList({ organizationId, fromDate, toDate, vendorId, searchString }) {
    let productAcquisitionList = await this.database.productAcquisition.listByFilters({ organizationId, fromDate, toDate, vendorId, searchString });
    return productAcquisitionList;
  }

  async __includeExtendedInformation({ productAcquisitionList }) {
    // get createdByUser
    let map = await this.crossmap({
      source: productAcquisitionList,
      sourceKey: 'createdByUserId',
      target: 'user'
    });
    map.forEach((user, productAcquisition) => {
      productAcquisition.createdByUser = extract(user, [
        'id',
        'fullName',
        'email',
        'phone',
      ])
    });

    // get product and productBlueprint
    let productList = productAcquisitionList.reduce(((productList, productAcquisition) => productList.concat(productAcquisition.productList)), []);
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

    // get inventory
    map = await this.crossmap({
      source: productAcquisitionList,
      sourceKey: 'inventoryId',
      target: 'inventory'
    });
    map.forEach((inventory, productAcquisition) => {
      delete inventory['productList'];
      productAcquisition.inventory = inventory;
    });

    // get vendor
    productAcquisitionList.forEach(productAcquisition => {
      productAcquisition.vendor = null;
    });
    let productAcquisitionListWithVendor = productAcquisitionList.filter(productAcquisition => productAcquisition.vendorId !== null);
    map = await this.crossmap({
      source: productAcquisitionListWithVendor,
      sourceKey: 'vendorId',
      target: 'vendor'
    });
    map.forEach((vendor, productAcquisition) => {
      productAcquisition.vendor = vendor
    });

    // append inventory container details to inventories
    let inventoryList = [].concat(
      productAcquisitionList.map(productAcquisition => productAcquisition.inventory),
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
    let productAcquisitionList = await this.__getProductAcquisitionList({ organizationId, fromDate, toDate, vendorId, searchString });
    await this.__includeExtendedInformation({ productAcquisitionList });
    return { productAcquisitionList };
  }

}