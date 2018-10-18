let { LegacyApi } = require('../legacy-api-base');
let Joi = require('joi');

let { salesCommonMixin } = require('./mixins/sales-common');

exports.GetDashboardSummaryApi = class extends salesCommonMixin(LegacyApi) {

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
      privilegeList: [
        "PRIV_VIEW_ORGANIZATION_STATISTICS"
      ]
    }];
  }

  _getSalesSummaryForDateRange({ organizationId, fromDate, toDate }, cbfn) {
    this._getSalesList({ organizationId, fromDate, toDate, outletId: null, customerId: null, shouldFilterByOutlet: false, shouldFilterByCustomer: false }, (salesList) => {
      let totalCount = salesList.length;
      let totalAmount = 0;
      salesList.forEach((sales) => {
        totalAmount += sales.payment.totalBilled;
      });
      cbfn({ totalAmount, totalCount });
    });
  }

  _getSalesSummaryForDay(organizationId, cbfn) {
    let fromDate = new Date();
    fromDate.setHours(0);
    fromDate.setMinutes(0);
    fromDate.setSeconds(0);
    fromDate = fromDate.getTime();
    let toDate = new Date();
    toDate.setHours(23);
    toDate.setMinutes(59);
    toDate = toDate.getTime();
    this._getSalesSummaryForDateRange({ organizationId, toDate, fromDate }, cbfn);
  }

  _getSalesSummaryForMonth(organizationId, cbfn) {
    let fromDate = new Date();
    fromDate.setDate(0);
    fromDate.setHours(0);
    fromDate.setMinutes(0);
    fromDate.setSeconds(0);
    fromDate = fromDate.getTime();
    let toDate = new Date();
    toDate.setHours(23);
    toDate.setMinutes(59);
    toDate = toDate.getTime();
    this._getSalesSummaryForDateRange({ organizationId, toDate, fromDate }, cbfn);
  }

  _getSalesSummary({ organizationId }, cbfn) {
    this._getSalesSummaryForDay(organizationId, ({ totalCount, totalAmount }) => {
      let totalNumberOfSalesToday = totalCount;
      let totalAmountSoldToday = totalAmount;

      this._getSalesSummaryForMonth(organizationId, ({ totalCount, totalAmount }) => {
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