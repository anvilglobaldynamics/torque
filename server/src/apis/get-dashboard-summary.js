let { Api } = require('./../api-base');
let Joi = require('joi');

let { salesCommonMixin } = require('./mixins/sales-common');

exports.GetDashboardSummaryApi = class extends salesCommonMixin(Api) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      organizationId: Joi.number().max(999999999999999).required(),
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privileges: [
        "PRIV_VIEW_ORGANIZATION_STATISTICS"
      ]
    }];
  }

  _getSalesSummaryForDate({ organizationId, fromDate, toDate }, cbfn) {
    this._getSalesList({ organizationId, fromDate, toDate, outletId: null, customerId: null, shouldFilterByOutlet: false, shouldFilterByCustomer: false }, (salesList) => {
      let totalCount = salesList.length;
      let totalAmount = 0;
      salesList.forEach((sales) => {
        totalAmount += sales.payment.totalBilled;
      });
      cbfn({ totalAmount, totalCount });
    });
  }

  _getSalesSummary({ organizationId }, cbfn) {
    let toDate = new Date();
    let fromDate = new Date();
    fromDate.setHours(0);
    fromDate.setMinutes(0);
    fromDate.setSeconds(0);
    this._getSalesSummaryForDate({ organizationId, toDate, fromDate }, ({ totalCount, totalAmount }) => {
      let totalNumberOfSalesToday = totalCount;
      let totalAmountSoldToday = totalAmount;

      let toDate = new Date();
      let fromDate = new Date();
      fromDate.setMonth(fromDate.getMonth() - 1);
      fromDate.setHours(0);
      fromDate.setMinutes(0);
      fromDate.setSeconds(0);
      this._getSalesSummaryForDate({ organizationId, toDate, fromDate }, ({ totalCount, totalAmount }) => {
        let totalNumberOfSalesThisMonth = totalCount;
        let totalAmountSoldThisMonth = totalAmount;
        
        cbfn({
          totalNumberOfSalesToday,
          totalAmountSoldToday,
          totalNumberOfSalesThisMonth,
          totalAmountSoldThisMonth
        });
      });
    });
  }

  handle({ body }) {
    let { organizationId } = body;
    this._getSalesSummary({ organizationId }, (metrics) => {
      this.success({ metrics });
    });
  }

}