const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');

const { salesCommonMixin } = require('./mixins/sales-common');

exports.GetDashboardSummaryApi = class extends Api.mixin(salesCommonMixin) {

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

  async _getSalesSummaryForDateRange({ organizationId, fromDate, toDate }) {
    let salesList = await this._getSalesList({ organizationId, fromDate, toDate, outletId: null, customerId: null, shouldFilterByOutlet: false, shouldFilterByCustomer: false });
    let totalCount = salesList.length;
    let totalAmount = 0;
    salesList.forEach((sales) => {
      totalAmount += sales.payment.totalBilled;
    });

    return ({ totalAmount, totalCount });
  }

  async _getSalesSummaryForDay(organizationId) {
    let fromDate = new Date();
    fromDate.setHours(0);
    fromDate.setMinutes(0);
    fromDate.setSeconds(0);
    fromDate = fromDate.getTime();
    let toDate = new Date();
    toDate.setHours(23);
    toDate.setMinutes(59);
    toDate = toDate.getTime();

    let { totalAmount, totalCount } = await this._getSalesSummaryForDateRange({ organizationId, toDate, fromDate });
    return ({ totalAmount, totalCount });
  }

  async _getSalesSummaryForMonth(organizationId) {
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

    let { totalAmount, totalCount } = await this._getSalesSummaryForDateRange({ organizationId, toDate, fromDate });
    return ({ totalAmount, totalCount });
  }

  async _getSalesSummary({ organizationId }) {
    let { totalCount, totalAmount } = await this._getSalesSummaryForDay(organizationId);
    let totalNumberOfSalesToday = totalCount;
    let totalAmountSoldToday = totalAmount;

    ({ totalCount, totalAmount } = await this._getSalesSummaryForMonth(organizationId));
    let totalNumberOfSalesThisMonth = totalCount;
    let totalAmountSoldThisMonth = totalAmount;

    return ({
      totalNumberOfSalesToday,
      totalAmountSoldToday,
      totalNumberOfSalesThisMonth,
      totalAmountSoldThisMonth
    });
  }

  async _getActivatedPackageDetails({ organizationId }) {
    let organization = await this.database.organization.findById({ id: organizationId });

    if (organization.packageActivationId) {
      let packageActivation = await this.database.packageActivation.findById({ id: organization.packageActivationId });

      let packageDetail = await this.database.fixture.findPackageByCode({ packageCode: packageActivation.packageCode });

      return ({
        packageActivation,
        packageDetail
      });
    } else {
      return null;
    }
  }

  async handle({ body }) {
    let { organizationId } = body;
    let metrics = await this._getSalesSummary({ organizationId });
    let organizationPackageDetails = await this._getActivatedPackageDetails({ organizationId });
    return { metrics, organizationPackageDetails };
  }

}