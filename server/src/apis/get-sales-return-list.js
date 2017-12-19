let { Api } = require('./../api-base');
let Joi = require('joi');

exports.GetSalesReturnListApi = class extends Api {

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

  _getSalesReturnList({ organizationId, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate }, cbfn) {
    this.database.outlet.listByOrganizationId({ organizationId }, (err, outletList) => {
      if (err) return this.fail(err);
      let outletIdList = outletList.map(outlet => outlet.id);
      this.database.sales.listByFiltersForSalesReturn({ outletIdList, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer }, (err, salesList) => {
        if (err) return this.fail(err);
        let salesIdList = salesList.map(sales => sales.id);
        this.database.salesReturn.listByFilters({ salesIdList, fromDate, toDate }, (err, salesReturnList) => {
          return cbfn(salesReturnList);
        });
      });
    });
  }

  handle({ body }) {
    let { organizationId, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate } = body;
    this._getSalesReturnList({ organizationId, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate }, (salesReturnList) => {
      this.success({ salesReturnList: salesReturnList });
    });
  }

}