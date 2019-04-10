
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');

exports.ReportCollectionDetailsApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required(),
      outletId: Joi.number().max(999999999999999).allow(null).required(),
      customerId: Joi.number().max(999999999999999).allow(null).required(),

      shouldFilterByOutlet: Joi.boolean().required(),
      shouldFilterByCustomer: Joi.boolean().required(),

      fromDate: Joi.number().max(999999999999999).required(),
      toDate: Joi.number().max(999999999999999).required()
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

  async __getSalesList({ organizationId, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate }) {
    let outletIdList = (await this.database.outlet.listByOrganizationId({ organizationId })).map(outlet => outlet.id);
    let salesList = await this.database.sales.listByFiltersForCollectionReport({ outletIdList, organizationId, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate, searchString });
    return salesList;
  }

  async __includeCustomerInformation({ salesList }) {
    let map = await this.crossmap({
      source: salesList,
      sourceKey: 'customerId',
      target: 'customer'
    });
    map.forEach((customer, sales) => sales.customer = customer);
  }

  async handle({ body }) {
    let { organizationId, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate} = body;
    toDate = this.__getExtendedToDate(toDate);
    await this.__verifyOutletIfNeeded({ outletId, shouldFilterByOutlet });
    await this.__verifyCustomerIfNeeded({ customerId, shouldFilterByCustomer });
    let salesList = await this.__getSalesList({ organizationId, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate });
    await this.__includeCustomerInformation({ salesList });
    return { salesList };
  }

}