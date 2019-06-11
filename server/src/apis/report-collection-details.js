
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

      paymentMethod: Joi.string().valid('cash', 'card', 'digital', 'change-wallet', null).required(),

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
    let salesList = await this.database.sales.listByFiltersForCollectionReport({ outletIdList, organizationId, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate });
    return salesList;
  }

  async __includeUserInformation({ collectionList }) {
    let map = await this.crossmap({
      source: collectionList,
      sourceKey: 'collectedByUserId',
      target: 'user'
    });
    map.forEach((user, collection) => {
      let { fullName, phone } = user;
      collection.collectedByUser = {
        fullName, phone
      }
    });
  }

  __prepareCollectionDetails({ salesList }) {
    let collectionList = []
    salesList.forEach(sales => {
      sales.payment.paymentList.forEach(payment => {
        collectionList.push({
          salesNumber: sales.salesNumber,
          salesId: sales.id,
          collectedAmount: payment.paidAmount,
          collectedByUserId: payment.acceptedByUserId,
          collectedDatetimeStamp: payment.createdDatetimeStamp,
          paymentMethod: payment.paymentMethod
        });
      });
    });
    return collectionList;
  }

  // NOTE: This is needed in order to avoid the initial payment taken during the creation
  // of a sale outside current boundary
  __filterByDateRange({ fromDate, toDate, collectionList }) {
    return collectionList.filter((collection) => {
      return fromDate <= collection.collectedDatetimeStamp && collection.collectedDatetimeStamp <= toDate;
    });
  }

  __filterByPaymentMethod({ paymentMethod, collectionList }) {
    if (paymentMethod === null) return collectionList;
    return collectionList.filter((collection) => {
      return collection.paymentMethod === paymentMethod;
    });
  }

  async handle({ body }) {
    let { organizationId, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate, paymentMethod } = body;
    toDate = this.__getExtendedToDate(toDate);
    await this.__verifyOutletIfNeeded({ outletId, shouldFilterByOutlet });
    await this.__verifyCustomerIfNeeded({ customerId, shouldFilterByCustomer });
    let salesList = await this.__getSalesList({ organizationId, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate });
    let collectionList = this.__prepareCollectionDetails({ salesList });
    collectionList = this.__filterByDateRange({ fromDate, toDate, collectionList });
    collectionList = this.__filterByPaymentMethod({ paymentMethod, collectionList });
    await this.__includeUserInformation({ collectionList });
    return { collectionList };
  }

}