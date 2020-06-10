
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');

exports.GetSalesReturnListApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get autoPaginates() { return ['salesReturnList']; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required(),
      outletId: Joi.number().max(999999999999999).allow(null).required(),
      customerId: Joi.number().max(999999999999999).allow(null).required(),

      shouldFilterByOutlet: Joi.boolean().required(),
      shouldFilterByCustomer: Joi.boolean().required(),

      fromDate: Joi.number().max(999999999999999).required(),
      toDate: Joi.number().max(999999999999999).required(),

      searchString: Joi.string().min(0).max(64).allow('').optional()
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privilegeList: [
        "PRIV_VIEW_SALES_RETURN"
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

  async __getSalesReturnList({ organizationId, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate }) {
    let outletIdList = (await this.database.outlet.listByOrganizationId({ organizationId })).map(outlet => outlet.id);
    let salesList = await this.database.sales.listByFiltersForSalesReturn(({ outletIdList, organizationId, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer }));
    let salesIdList = salesList.map(sales => sales.id);
    let salesReturnList = await this.database.salesReturn.listByFilters({ salesIdList, fromDate, toDate });
    salesReturnList.forEach(salesReturn => {
      let sales = salesList.find(sales => sales.id === salesReturn.salesId);
      salesReturn.salesNumber = sales.salesNumber;
    });
    return salesReturnList;
  }

  _getFilterBySalesNumberFromSearchString(searchString) {
    if (searchString && parseInt(searchString) >= 0) {
      return parseInt(searchString);
    }
    return null;
  }

  async handle({ body }) {
    let { organizationId, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate, searchString } = body;
    toDate = this.__getExtendedToDate(toDate);

    let salesReturnList = [];
    let filterBySalesNumber = this._getFilterBySalesNumberFromSearchString(searchString);
    if (filterBySalesNumber) {
      let outletIdList = (await this.database.outlet._find({ organizationId })).map(outlet => outlet.id);
      let sales = await this.database.sales.findBySalesNumber({ salesNumber: filterBySalesNumber, outletIdList });
      if (sales) {
        salesReturnList = await this.database.salesReturn.listBySalesId({ salesId: sales.id });
        salesReturnList.forEach(salesReturn => salesReturn.salesNumber = sales.salesNumber);
      }
    } else {
      await this.__verifyOutletIfNeeded({ outletId, shouldFilterByOutlet });
      await this.__verifyCustomerIfNeeded({ customerId, shouldFilterByCustomer });
      salesReturnList = await this.__getSalesReturnList({ organizationId, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate });
    }

    return { salesReturnList };
  }

}