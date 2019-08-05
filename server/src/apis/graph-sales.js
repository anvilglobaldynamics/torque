
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');

exports.GraphSalesApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required(),
      shouldFilterByOutlet: Joi.boolean().required(),
      outletId: Joi.number().max(999999999999999).allow(null).required(),
      fromDate: Joi.number().max(999999999999999).required(),
      periodLevel: Joi.string().valid('week', 'month', 'quarter', 'year')
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privilegeList: [
        "PRIV_VIEW_SALES"
      ],
      moduleList: [
        "MOD_PRODUCT",
        "MOD_SERVICE",
      ]
    }];
  }

  async __verifyOutletIfNeeded({ outletId, shouldFilterByOutlet }) {
    if (shouldFilterByOutlet) {
      let doc = await this.database.outlet.findById({ id: outletId });
      throwOnFalsy(doc, "OUTLET_INVALID", "Outlet not found.");
    }
  }

  __setToDayEnd(date) {
    date.setHours(23);
    date.setMinutes(59);
    date.setSeconds(59);
    date.setMilliseconds(999);
  }

  __setToDayStart(date) {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
  }

  __prepareDateRanges({ fromDate, periodLevel }) {
    const weekDayList = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const monthDayList = (new Array(31)).fill(null).map((_, i) => i + 1);
    const yearMonthList = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    let refDate = new Date(fromDate);

    let dateRangeList = [];

    if (periodLevel === 'week') {
      let dow = refDate.getDay(); // NOTE: 0 = sunday

      let rangeListStartDate = new Date(fromDate);
      rangeListStartDate.setDate(rangeListStartDate.getDate() - dow);

      for (let i = 0; i < weekDayList.length; i++) {

        let startDate = new Date(rangeListStartDate.getTime());
        startDate.setDate(startDate.getDate() + i);
        this.__setToDayStart(startDate);
        let startDatetimeStamp = startDate.getTime();

        let endDate = new Date(rangeListStartDate.getTime());
        endDate.setDate(endDate.getDate() + i);
        this.__setToDayEnd(endDate);
        let endDatetimeStamp = endDate.getTime();

        dateRangeList.push({
          startDatetimeStamp,
          endDatetimeStamp,
          label: weekDayList[i]
        });
      }
    } else if (periodLevel === 'month') {
      let dom = refDate.getDate() - 1; // NOTE: getDate starts from 1

      let rangeListStartDate = new Date(fromDate);
      rangeListStartDate.setDate(rangeListStartDate.getDate() - dom);

      for (let i = 0; i < monthDayList.length; i++) {

        let startDate = new Date(rangeListStartDate.getTime());
        startDate.setDate(startDate.getDate() + (i));
        this.__setToDayStart(startDate);
        let startDatetimeStamp = startDate.getTime();

        if (startDate.getMonth() !== refDate.getMonth()) continue;

        let endDate = new Date(rangeListStartDate.getTime());
        endDate.setDate(endDate.getDate() + (i));
        this.__setToDayEnd(endDate);
        let endDatetimeStamp = endDate.getTime();

        dateRangeList.push({
          startDatetimeStamp,
          endDatetimeStamp,
          label: monthDayList[i]
        });
      }
    }

    return dateRangeList;
  }

  async _getSalesGraphData({ outletIdList, outletId, shouldFilterByOutlet, dateRangeList }) {
    let query = { $and: [] };

    if (shouldFilterByOutlet) {
      query.$and.push({ outletId });
    } else {
      query.$and.push({
        outletId: { $in: outletIdList }
      });
    }

    let labelList = [];
    let sumCountList = [];
    let sumTotalBilledList = [];

    for (let dateRange of dateRangeList) {
      let { startDatetimeStamp, endDatetimeStamp, label } = dateRange;

      let localQuery = JSON.parse(JSON.stringify(query));

      localQuery.$and.push({
        createdDatetimeStamp: {
          $gte: startDatetimeStamp,
          $lte: endDatetimeStamp
        }
      });

      // FIXME: Create database methods
      let res = await this.database.engine.getDatabaseHandle().collection('sales').aggregate([
        {
          $match: localQuery
        }, {
          $group: {
            _id: null,
            sumTotalBilled: {
              $sum: '$payment.totalBilled'
            },
            sumCount: {
              $sum: 1
            }
          }
        }
      ]).toArray();

      if (res.length === 0) {
        res = [{ sumTotalBilled: 0, sumCount: 0 }];
      }

      let { sumTotalBilled, sumCount } = res[0];

      labelList.push(label);
      sumTotalBilledList.push(sumTotalBilled);
      sumCountList.push(sumCount);
    }

    return { labelList, sumTotalBilledList, sumCountList };
  }

  async handle({ body }) {
    let { organizationId, outletId, shouldFilterByOutlet, fromDate, periodLevel } = body;

    await this.__verifyOutletIfNeeded({ outletId, shouldFilterByOutlet });

    let outletIdList = (await this.database.outlet.listByOrganizationId({ organizationId })).map(outlet => outlet.id);

    let dateRangeList = this.__prepareDateRanges({ fromDate, periodLevel });

    let graphData = await this._getSalesGraphData({ outletIdList, outletId, shouldFilterByOutlet, dateRangeList });

    return graphData;

  }

}