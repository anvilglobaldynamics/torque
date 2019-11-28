const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { InventoryMixin } = require('./mixins/inventory-mixin');

exports.ReportProductSalesDetailsApi = class extends Api.mixin(InventoryMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required(),
      outletId: Joi.number().max(999999999999999).allow(null).required(),
      productCategoryIdList: Joi.array().allow([]).min(0).items(
        Joi.number().max(999999999999999)
      ),
      productBlueprintIdList: Joi.array().allow([]).min(0).items(
        Joi.number().max(999999999999999)
      ),
      fromDate: Joi.number().max(999999999999999).required(),
      toDate: Joi.number().max(999999999999999).required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: 'organizationId',
      privilegeList: [
        "PRIV_VIEW_REPORTS"
      ],
      moduleList: [
        "MOD_PRODUCT",
      ]
    }];
  }

  async __getSalesList({ organizationId, outletId, fromDate, toDate }) {
    let outletIdList = (await this.database.outlet.listByOrganizationId({ organizationId })).map(outlet => outlet.id);

    let shouldFilterByOutlet = (outletId === null ? false : true);

    let salesList = await this.database.sales.listByFiltersForProductSalesReport({
      outletIdList,
      organizationId,
      outletId,
      shouldFilterByOutlet,
      shouldFilterByCustomer: false,
      customer: null,
      fromDate,
      toDate
    });
    salesList = salesList.filter(sales => !sales.isDiscarded);
    return salesList;
  }

  __getExtendedToDate(toDate) {
    toDate = new Date(toDate);
    toDate.setHours(23);
    toDate.setMinutes(59);
    toDate = toDate.getTime();
    return toDate;
  }

  async __prepareProductList({ salesList }) {
    let productList = salesList.reduce(((productList, sale) => productList.concat(sale.productList)), []);

    let map = await this.crossmap({
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
    return productList;
  }

  async __filterProductList({ productList, productCategoryIdList, productBlueprintIdList }) {
    if (productCategoryIdList.length && productBlueprintIdList.length) {
      throw new CodedError("PREDETERMINER_SETUP_INVALID", "Can not filter by both Product Category and Product Blueprint.");
    }

    if (productCategoryIdList.length === 0 && productBlueprintIdList.length === 0) {
      return productList;
    }

    if (productCategoryIdList.length > 0) {
      return productList.filter(product => {

        let list = product.productBlueprint.productCategoryIdList;

        if (list.length === 0) return false;
        return productCategoryIdList.every(productCategoryId => {
          return (list.indexOf(productCategoryId) > -1);
        });

      });

    } else {
      return productList.filter(product => {
        return productBlueprintIdList.indexOf(product.productBlueprint.id) > -1;
      });
    }
  }

  __getProductSalesSummaryList({ productList }) {
    let map = {};
    productList.forEach(soldProduct => {
      let key = String(soldProduct.productId);

      if (!(key in map)) {
        map[key] = {
          productId: key,
          productBlueprintId: soldProduct.productBlueprint.id,
          name: soldProduct.productBlueprint.name,
          unit: soldProduct.productBlueprint.unit,
          sumCount: 0,
          sumSalePrice: 0
        }
      }

      let sumProduct = map[key];

      sumProduct.sumCount += soldProduct.count;
      sumProduct.sumSalePrice += (soldProduct.count * soldProduct.salePrice);
    });
    let productSalesSummaryList = Object.keys(map).map(key => map[key]);
    return productSalesSummaryList;
  }

  async __verifyOutletIfNeeded({ outletId }) {
    if (outletId) {
      let doc = await this.database.outlet.findById({ id: outletId });
      throwOnFalsy(doc, "OUTLET_INVALID", "Outlet not found.");
    }
  }

  async __verifyOutletIfNeeded({ outletId }) {
    if (outletId) {
      let doc = await this.database.outlet.findById({ id: outletId });
      throwOnFalsy(doc, "OUTLET_INVALID", "Outlet not found.");
    }
  }

  async __verifyProductCategoryIdList({ organizationId, productCategoryIdList }) {
    let productCategoryList = await this.database.productCategory.listByOrganizationIdAndIdList({ organizationId, idList: productCategoryIdList });
    if (productCategoryList.length !== productCategoryIdList.length) {
      throw new CodedError("PRODUCT_CATEGORY_INVALID", "The product category you provided is invalid");
    }
  }

  async __verifyProductBlueprintIdList({ organizationId, productBlueprintIdList }) {
    let productBlueprintList = await this.database.productBlueprint.listByOrganizationIdAndIdList({ organizationId, idList: productBlueprintIdList });
    if (productBlueprintList.length !== productBlueprintIdList.length) {
      throw new CodedError("PRODUCT_BLUEPRINT_INVALID", "The product Blueprint you provided is invalid");
    }
  }

  async handle({ body }) {
    let { organizationId, outletId, productCategoryIdList, productBlueprintIdList, fromDate, toDate } = body;
    toDate = this.__getExtendedToDate(toDate);

    await this.__verifyOutletIfNeeded({ outletId });
    await this.__verifyProductCategoryIdList({ organizationId, productCategoryIdList });
    await this.__verifyProductBlueprintIdList({ organizationId, productBlueprintIdList });

    let salesList = await this.__getSalesList({ organizationId, outletId, fromDate, toDate });
    let productList = await this.__prepareProductList({ salesList });
    productList = await this.__filterProductList({ productList, productCategoryIdList, productBlueprintIdList });
    let productSalesSummaryList = this.__getProductSalesSummaryList({ productList });

    return { productSalesSummaryList };
  }

}