let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');
let { outletCommonMixin } = require('./mixins/outlet-common');
let { customerCommonMixin } = require('./mixins/customer-common');

exports.GetSalesReturnListApi = class extends outletCommonMixin(customerCommonMixin(collectionCommonMixin(LegacyApi))) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get autoPaginates() { return ['salesReturnList']; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

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
        "PRIV_VIEW_SALES_RETURN"
      ],
      moduleList: [
        "MOD_PRODUCT",
      ]
    }];
  }

  _verifyOutletIfNeeded({ outletId, shouldFilterByOutlet }, cbfn) {
    if (!shouldFilterByOutlet) return cbfn();
    this._verifyOutletExist({ outletId }, cbfn);
  }

  _verifyCustomerIfNeeded({ customerId, shouldFilterByCustomer }, cbfn) {
    if (!shouldFilterByCustomer) return cbfn();
    this._verifyCustomerExist({ customerId }, cbfn);
  }

  _getSalesReturnList({ organizationId, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate }, cbfn) {
    this.legacyDatabase.outlet.listByOrganizationId({ organizationId }, (err, outletList) => {
      if (err) return this.fail(err);
      let outletIdList = outletList.map(outlet => outlet.id);
      this.legacyDatabase.sales.listByFiltersForSalesReturn({ outletIdList, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer }, (err, salesList) => {
        if (err) return this.fail(err);
        let salesIdList = salesList.map(sales => sales.id);
        this.legacyDatabase.salesReturn.listByFilters({ salesIdList, fromDate, toDate }, (err, salesReturnList) => {
          return cbfn(salesReturnList);
        });
      });
    });
  }

  handle({ body }) {
    let { organizationId, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate } = body;

    toDate = new Date(toDate);
    toDate.setHours(23);
    toDate.setMinutes(59);
    toDate = toDate.getTime();
    
    this._verifyOutletIfNeeded({ outletId, shouldFilterByOutlet }, () => {
      this._verifyCustomerIfNeeded({ customerId, shouldFilterByCustomer }, () => {
        this._getSalesReturnList({ organizationId, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate }, (salesReturnList) => {
          this.success({ salesReturnList });
        });
      });
    });
  }

}