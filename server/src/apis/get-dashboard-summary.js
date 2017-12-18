let { Api } = require('./../api-base');
let Joi = require('joi');

exports.GetDashboardSummaryApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      organizationId: Joi.number().max(999999999999999).required(),
    });
  }

  _getSalesList({ organizationId, fromDate, toDate }, cbfn) {
    let outletId, customerId, shouldFilterByOutlet = false, shouldFilterByCustomer = false;
    this.database.outlet.listByOrganizationId(organizationId, (err, outletList) => {
      if (err) return this.fail(err);
      let outletIdList = outletList.map(outlet => outlet.id);
      this.database.sales.listByFilters({ outletIdList, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate }, (err, salesList) => {
        if (err) return this.fail(err);
        return cbfn(salesList);
      });
    });
  }

  _getSalesSummaryForDate({ organizationId, fromDate, toDate }, cbfn) {
    this._getSalesList({ organizationId, fromDate, toDate }, (salesList) => {
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