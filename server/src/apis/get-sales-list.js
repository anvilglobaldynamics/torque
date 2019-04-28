
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');

exports.GetSalesListApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get autoPaginates() { return ['salesList']; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required(),
      outletId: Joi.number().max(999999999999999).allow(null).required(),
      customerId: Joi.number().max(999999999999999).allow(null).required(),

      shouldFilterByOutlet: Joi.boolean().required(),
      shouldFilterByCustomer: Joi.boolean().required(),

      fromDate: Joi.number().max(999999999999999).required(),
      toDate: Joi.number().max(999999999999999).required(),

      includeExtendedInformation: Joi.boolean().optional(),
      searchString: Joi.string().min(0).max(64).allow('').optional()
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privilegeList: [
        "PRIV_VIEW_SALES"
      ],
      moduleList: [
        "MOD_PRODUCT",
        "MOD_SERVICE",
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

  _verifyOutletIfNeeded({ outletId, shouldFilterByOutlet }, cbfn) {
    if (!shouldFilterByOutlet) return cbfn();
    this._verifyOutletExist({ outletId }, cbfn);
  }

  _verifyCustomerIfNeeded({ customerId, shouldFilterByCustomer }, cbfn) {
    if (!shouldFilterByCustomer) return cbfn();
    this._verifyCustomerExist({ customerId }, cbfn);
  }

  async __verifyOutletIfNeeded({ outletId, shouldFilterByOutlet }) {
    if (shouldFilterByOutlet) {
      let doc = await this.database.outlet.findById({ id: outletId });
      throwOnFalsy(doc, "OUTLET_INVALID", "Outlet not found.");
    }
  }

  async __verifyCustomerIfNeeded({ customerId, shouldFilterByCustomer }) {
    if (shouldFilterByCustomer) {
      let doc = await this.database.customer.findById({ id: customerId });
      throwOnFalsy(doc, "CUSTOMER_INVALID", "Customer not found.");
    }
  }

  async __getSalesList({ organizationId, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate, searchString }) {
    let outletIdList = (await this.database.outlet.listByOrganizationId({ organizationId })).map(outlet => outlet.id);
    let salesList = await this.database.sales.listByFilters({ outletIdList, organizationId, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate, searchString });
    return salesList;
  }

  async __includeExtendedInformationIfNeeded({ salesList, includeExtendedInformation }) {
    if (!includeExtendedInformation) return;
    let map = await this.crossmap({
      source: salesList,
      sourceKey: 'customerId',
      target: 'customer'
    });
    map.forEach((customer, sales) => sales.customer = customer);

    let productList = salesList.reduce(((productList, sale) => productList.concat(sale.productList)), []);
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

    let serviceList = salesList.reduce(((serviceList, sale) => serviceList.concat(sale.serviceList)), []);
    map = await this.crossmap({
      source: serviceList,
      sourceKey: 'serviceId',
      target: 'service'
    });
    map.forEach((service, soldService) => soldService.service = service);
    map = await this.crossmap({
      source: serviceList,
      sourceKeyFn: (soldService) => soldService.service.serviceBlueprintId,
      target: 'serviceBlueprint'
    });
    map.forEach((serviceBlueprint, soldService) => soldService.serviceBlueprint = serviceBlueprint);
  }

  async __includeDiscountPresetName({ salesList }) {
    salesList.forEach(sales => sales.payment.discountPresetName = '');
    let discountedSalesList = salesList.filter(sales => sales.payment.discountPresetId !== null);
    let map = await this.crossmap({
      source: discountedSalesList,
      sourceKey: (sales) => sales.payment.discountPresetId,
      target: 'discountPreset'
    });
    map.forEach((discountPreset, sales) => sales.payment.discountPresetName = discountPreset.name);
  }

  async handle({ body }) {
    let { organizationId, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate, includeExtendedInformation, searchString } = body;
    toDate = this.__getExtendedToDate(toDate);
    await this.__verifyOutletIfNeeded({ outletId, shouldFilterByOutlet });
    await this.__verifyCustomerIfNeeded({ customerId, shouldFilterByCustomer });
    let salesList = await this.__getSalesList({ organizationId, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate, searchString });
    await this.__includeExtendedInformationIfNeeded({ salesList, includeExtendedInformation });
    await this.__includeDiscountPresetName({ salesList });
    return { salesList };
  }

}