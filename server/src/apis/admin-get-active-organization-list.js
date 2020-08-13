
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');

exports.AdminGetActiveOrganizationApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get authenticationLevel() { return 'admin'; }

  get requestSchema() {
    return Joi.object().keys({
      apiKey: Joi.string().length(64).required()
    });
  }

  async handle({ }) {

    let endDate = new Date(new Date().toISOString().split('T')[0]); // Get today without time.
    endDate.setDate(endDate.getDate() - 1); // exclude today

    let startDate = new Date(endDate.getTime());
    startDate.setDate(endDate.getDate() - 90); // show stats for 30 days

    let dateCount = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

    // Step 1. Find only organizations that were active in the period.
    let outletVsSalesCountList = (await this.database.engine._db.collection('sales').aggregate([
      {
        $match: {
          isDiscarded: false,
          createdDatetimeStamp: {
            $gte: startDate.getTime(),
            $lte: endDate.getTime()
          }
        }
      },
      { "$group": { _id: "$outletId", count: { $sum: 1 }, totalSalesRevenue: { $sum: "$payment.totalBilled" } } }
    ]).sort({ count: -1 }).toArray());

    console.log({outletVsSalesCountList})

    let outletVsSalesCountMap = {};
    outletVsSalesCountList.forEach(outletVsSalesCount => {
      outletVsSalesCountMap[String(outletVsSalesCount._id)] = outletVsSalesCount;
    })

    let outletIdList = outletVsSalesCountList.map(i => i._id);
    let outletList = await this.database.outlet.listByIdList({ idList: outletIdList });

    let organizationIdList = outletList.map(i => i.organizationId);
    let organizationList = await this.database.organization.listByIdList({ idList: organizationIdList });

    organizationList.forEach((organization) => {
      organization.outletIdList = [];
      organization.metrics = {
        salesCount: 0,
        totalSalesRevenue: 0
      };
      outletList.forEach(outlet => {
        if (outlet.organizationId === organization.id) {
          organization.outletIdList.push(outlet.id);
          if (String(outlet.id) in outletVsSalesCountMap) {
            organization.metrics.salesCount += outletVsSalesCountMap[String(outlet.id)].count;
            organization.metrics.totalSalesRevenue += outletVsSalesCountMap[String(outlet.id)].totalSalesRevenue;
          }
        }
      });
    });

    // Step 2. For every organization, find out - 
    // totalSalesRevenue, lastSalesDate, total days active
    for (let organization of organizationList) {
      let lastSales = await this.database.sales._findOne({
        outletId: {
          $in: organization.outletIdList
        }
      }, {
        sort: {
          createdDatetimeStamp: -1
        }
      });
      organization.metrics.lastSalesDate = lastSales.createdDatetimeStamp;

    }

    // Step 3. Sort
    organizationList.sort((a,b)=>{
      return (b.metrics.salesCount - a.metrics.salesCount);
    })

    return { organizationList };
  }

  __getExtendedToDate(toDate) {
    toDate = new Date(toDate);
    toDate.setHours(23);
    toDate.setMinutes(59);
    toDate = toDate.getTime();
    return toDate;
  }

}
