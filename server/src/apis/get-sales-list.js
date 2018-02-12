let { Api } = require('./../api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');
let { outletCommonMixin } = require('./mixins/outlet-common');
let { customerCommonMixin } = require('./mixins/customer-common');

exports.GetSalesListApi = class extends outletCommonMixin(customerCommonMixin(collectionCommonMixin(Api))) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

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
      privileges: [
        "PRIV_VIEW_SALES"
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

  _getSalesList({ organizationId, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate }, cbfn) {
    this.database.outlet.listByOrganizationId({ organizationId }, (err, outletList) => {
      if (err) return this.fail(err);
      let outletIdList = outletList.map(outlet => outlet.id);
      this.database.sales.listByFilters({ outletIdList, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate }, (err, salesList) => {
        if (err) return this.fail(err);
        return cbfn(salesList);
      });
    });
  }

  handle({ body }) {
    let { organizationId, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate } = body;
    this._verifyOutletIfNeeded({ outletId, shouldFilterByOutlet }, () => {
      this._verifyCustomerIfNeeded({ customerId, shouldFilterByCustomer }, () => {
        this._getSalesList({ organizationId, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate }, (salesList) => {
          this.success({ salesList: salesList });
        });
      });
    });
  }

}