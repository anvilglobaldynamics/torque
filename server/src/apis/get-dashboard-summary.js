const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');

const { SalesMixin } = require('./mixins/sales-mixin');

exports.GetDashboardSummaryApi = class extends Api.mixin(SalesMixin) {

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
        // NOTE: This is commented out to correctly show checklist on page-home
        // "PRIV_VIEW_ORGANIZATION_STATISTICS"
      ]
    }];
  }

  async _getSalesSummaryForDateRange({ organizationId, fromDate, toDate, outletId }) {
    let salesList = await this._getSalesList({ organizationId, fromDate, toDate, outletId, customerId: null, shouldFilterByOutlet: (outletId ? true : false), shouldFilterByCustomer: false });
    salesList = salesList.filter(sales => !sales.isDiscarded);
    let totalCount = salesList.length;
    let totalAmount = 0;
    salesList.forEach((sales) => {
      totalAmount += sales.payment.totalBilled;
    });
    return ({ totalAmount, totalCount });
  }

  async _getSalesSummaryForDay({ organizationId, outletId }) {
    let fromDate = new Date();
    fromDate.setHours(0);
    fromDate.setMinutes(0);
    fromDate.setSeconds(0);
    fromDate = fromDate.getTime();
    let toDate = new Date();
    toDate.setHours(23);
    toDate.setMinutes(59);
    toDate = toDate.getTime();

    let { totalAmount, totalCount } = await this._getSalesSummaryForDateRange({ organizationId, toDate, fromDate, outletId });
    return ({ totalAmount, totalCount });
  }

  async _getSalesSummaryForMonth({ organizationId, outletId }) {
    let fromDate = new Date();
    fromDate.setDate(1);
    fromDate.setHours(0);
    fromDate.setMinutes(0);
    fromDate.setSeconds(0);
    fromDate = fromDate.getTime();
    let toDate = new Date();
    toDate.setHours(23);
    toDate.setMinutes(59);
    toDate = toDate.getTime();

    let { totalAmount, totalCount } = await this._getSalesSummaryForDateRange({ organizationId, toDate, fromDate, outletId });
    return ({ totalAmount, totalCount });
  }

  async _getSalesSummary({ organizationId, outletId }) {
    let { totalCount, totalAmount } = await this._getSalesSummaryForDay({ organizationId, outletId });
    let totalNumberOfSalesToday = totalCount;
    let totalAmountSoldToday = totalAmount;

    ({ totalCount, totalAmount } = await this._getSalesSummaryForMonth({ organizationId, outletId }));
    let totalNumberOfSalesThisMonth = totalCount;
    let totalAmountSoldThisMonth = totalAmount;

    return ({
      totalNumberOfSalesToday,
      totalAmountSoldToday,
      totalNumberOfSalesThisMonth,
      totalAmountSoldThisMonth
    });
  }

  async _getOutletSalesSummary({ organizationId }) {
    let outletList = await this.database.outlet._find({ organizationId });
    if (outletList.length < 2) return [];
    let outletMetricList = [];
    for (let outlet of outletList) {
      let metrics = await this._getSalesSummary({ organizationId, outletId: outlet.id });
      metrics.outlet = outlet;
      outletMetricList.push(metrics);
    }
    return outletMetricList;
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

  async _getUsageFlags({ organizationId }) {
    let outletList = await this.database.outlet._find({ organizationId }, {
      sort: {
        createdDatetimeStamp: 1
      }
    });
    let outletIdList = outletList.map(outlet => outlet.id);

    let hasAnyOutlet = (outletList).length > 0;
    let hasAnyProductBlueprint = (await this.database.productBlueprint._find({ organizationId })).length > 0;
    let hasAnyVendor = (await this.database.vendor._find({ organizationId })).length > 0;
    let hasAnyProductAcquisition = (await this.database.productAcquisition._find({ organizationId })).length > 0;
    let hasAnyServiceBlueprint = (await this.database.serviceBlueprint._find({ organizationId })).length > 0;

    let hasAnySales = false;
    if (outletList.length > 0) {
      let salesList = (await this.database.sales._find({ outletId: { $in: outletIdList } }))
      hasAnySales = salesList.length > 0;
    }

    let hasUpdatedFirstOutlet = false;
    if (outletList.length > 0) {
      let outlet = outletList[0];
      if (outlet.createdDatetimeStamp !== outlet.lastModifiedDatetimeStamp) {
        hasUpdatedFirstOutlet = true;
      }
    }

    let defaultFirstInventory = await this.database.inventory._findOne({ organizationId, inventoryContainerType: 'outlet', type: 'default' }, {
      sort: {
        createdDatetimeStamp: 1
      }
    });
    let defaultFirstInventoryId = (defaultFirstInventory ? defaultFirstInventory.id : null);

    return {
      hasAnyOutlet,
      outletIdList,
      defaultFirstInventoryId,
      hasAnyProductBlueprint,
      hasAnyVendor,
      hasAnyProductAcquisition,
      hasAnyServiceBlueprint,
      hasUpdatedFirstOutlet,
      hasAnySales
    }
  }

  async handle({ body }) {
    let { organizationId } = body;
    let metrics = await this._getSalesSummary({ organizationId, outletId: null });
    let outletMetricList = await this._getOutletSalesSummary({ organizationId });
    let organizationPackageDetails = await this._getActivatedPackageDetails({ organizationId });
    let usageFlags = await this._getUsageFlags({ organizationId });
    return { metrics, outletMetricList, organizationPackageDetails, usageFlags };
  }

}