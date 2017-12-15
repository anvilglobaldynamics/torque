let { Api } = require('./../api-base');
let Joi = require('joi');

exports.GetSalesListApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      organizationId: Joi.number().max(999999999999999).required(),
      outletId: Joi.number().max(999999999999999).allow(null).required(),
      customerId: Joi.number().max(999999999999999).allow(null).required(),
      
      fromDate: Joi.number().max(999999999999999).required(),
      toDate: Joi.number().max(999999999999999).required()
    });
  }

  _getSalesList({ organizationId, outletId, customerId, fromDate, toDate }, cbfn) {
    this.database.sales.listByFilter({ outletId }, (err, salesList) => {
      if (err) return this.fail(err);
      return cbfn(salesList);
    });
  }

  handle({ body }) {
    let { organizationId, outletId, customerId, fromDate, toDate } = body;
    this._getSalesList({ organizationId, outletId, customerId, fromDate, toDate }, (salesList) => {
      this.success({ salesList: salesList });
    });
  }

}