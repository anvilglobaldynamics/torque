
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');

exports.GetProductTransferListApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get autoPaginates() { return ['productTransferList']; }

  get requestSchema() {
    return Joi.object().keys({

      organizationId: Joi.number().max(999999999999999).required(),

      fromDate: Joi.number().max(999999999999999).required(),
      toDate: Joi.number().max(999999999999999).required(),

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

  async __getProductTransferList({ organizationId, fromDate, toDate, searchString }) {
    let productTransferList = await this.database.productTransfer.listByFilters({ organizationId, fromDate, toDate, searchString });
    return productTransferList;
  }

  async __includeExtendedInformation({ productTransferList }) {
    let map = await this.crossmap({
      source: productTransferList,
      sourceKey: 'createdByUserId',
      target: 'user'
    });
    map.forEach((user, productTransfer) => productTransfer.user = user);

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
  }

  async handle({ body }) {
    let { organizationId, fromDate, toDate, searchString } = body;
    toDate = this.__getExtendedToDate(toDate);
    let productTransferList = await this.__getProductTransferList({ organizationId, fromDate, toDate, searchString });
    await this.__includeExtendedInformation({ productTransferList });
    return { productTransferList };
  }

}