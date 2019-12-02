
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');

exports.AdminGetStatisticsApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get authenticationLevel() { return 'admin'; }

  get requestSchema() {
    return Joi.object().keys({
      apiKey: Joi.string().length(64).required()
    });
  }

  async handle({ }) {

    let statistics = {
      liteProducts: {
        total: 0
      },
      liteUsers: {
        total: 0,
        hasAtLeast1Sale: 0,
        hasAtLeast5Sales: 0
      },
      liteCustomers: {
        total: 0
      },
      liteReceipts: {
        total: 0,
        noReceipt: 0,
        byEmail: 0,
        byOwnSms: 0
      },
      premiumReceipts: {
        total: 0,
        noReceipt: 0,
        printed: 0,
        byEmail: 0
      },
      urlHits: {}
    };

    // products
    let productList = await this.database.product._find({ originApp: 'torque-lite' });
    statistics.liteProducts.total = productList.length;

    // users
    let userList = await this.database.user._find({ originApp: 'torque-lite' });
    statistics.liteUsers.total = userList.length;

    for (let user of userList) {
      // because on lipi lite, there is only one owner and they are the one accepting payment.
      let salesList = await this.database.sales._find({ originApp: 'torque-lite', "payment.paymentList.acceptedByUserId": user.id });

      if (salesList.length > 1) {
        statistics.liteUsers.hasAtLeast1Sale += 1;
      }

      if (salesList.length >= 5) {
        let salesIdList = salesList.map(i => i.id);
        let receiptList = await this.database.receipt._find({ salesId: { $in: salesIdList }, sentHistory: { $ne: [] } });
        if (receiptList.length >= 5) {
          statistics.liteUsers.hasAtLeast5Sales += 1;
        }
      }
    }

    // receipts
    let receiptList = await this.database.receipt._find({ originApp: 'torque-lite' });
    statistics.liteReceipts.total = receiptList.length;
    receiptList.forEach(receipt => {
      if (receipt.sentHistory.length === 0) {
        statistics.liteReceipts.noReceipt += 1;
        return;
      }
      if (receipt.sentHistory[0].sentVia === 'email') {
        statistics.liteReceipts.byEmail += 1;
      } else {
        statistics.liteReceipts.byOwnSms += 1;
      }
    });

    // customers
    let customerList = await this.database.customer._find({ originApp: 'torque-lite' });
    statistics.liteCustomers.total = customerList.length;

    // urlHists
    let urlAnalytics = await this.database.urlAnalytics._find({ which: 'only' });
    if (urlAnalytics.length > 0) {
      statistics.urlHits = urlAnalytics[0].urlHits;
      for (let key in statistics.urlHits) {
        let stamp = statistics.urlHits[key].lastHitDatetimeStamp;
        delete statistics.urlHits[key].lastHitDatetimeStamp;
        let date = (new Date(stamp));
        date.setHours(date.getHours() + 6); // timezone
        statistics.urlHits[key].lastHit = date.toISOString();
      }
    }

    // receipts
    let receiptList2 = await this.database.receipt._find({ originApp: 'torque' });
    statistics.premiumReceipts.total = receiptList2.length;
    receiptList2.forEach(receipt => {
      if (receipt.sentHistory.length === 0) {
        statistics.premiumReceipts.noReceipt += 1;
        return;
      }
      if (receipt.sentHistory[0].sentVia === 'email') {
        statistics.premiumReceipts.byEmail += 1;
      } else if (receipt.sentHistory[0].sentVia === 'print') {
        statistics.premiumReceipts.printed += 1;
      }
    });

    // Daily Statistics
    let dailyStatistics = {
      table: 'Date\t\tDAU\tSales\n'
    };

    // let startDate = new Date('2019-11-01');
    // let endDate = new Date('2019-11-30');

    let endDate = new Date(new Date().toISOString().split('T')[0]); // Get today without time.
    endDate.setDate(endDate.getDate()-1); // exclude today

    let startDate = new Date(endDate.getTime());
    startDate.setDate(endDate.getDate() - 29); // show stats for 30 days

    let dateCount = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

    for (let i = 0; i <= dateCount; i++) {
      let date = new Date(startDate.getTime());
      date.setDate(date.getDate() + i);

      let dateString = date.toISOString().replace('T00:00:00.000Z', '');
      let dateWithEndTime = new Date(date.toISOString().replace('T00:00:00.000Z', 'T23:59:59.000Z'));

      let collectionName = 'sales';
      let dauCount = (await this.database.engine._db.collection(collectionName).aggregate([
        {
          $match: {
            originApp: 'torque-lite',
            createdDatetimeStamp: {
              $gte: date.getTime(),
              $lte: dateWithEndTime.getTime()
            }
          }
        },
        { "$group": { _id: "$outletId", count: { $sum: 1 } } }
      ]).sort({ count: -1 }).toArray()).length;

      collectionName = 'sales';
      let salesCount = (await this.database.engine._db.collection(collectionName).aggregate([
        {
          $match: {
            originApp: 'torque-lite',
            createdDatetimeStamp: {
              $gte: date.getTime(),
              $lte: dateWithEndTime.getTime()
            }
          }
        },
      ]).sort({ count: -1 }).toArray()).length;

      let str = `"${dateString}"\t${dauCount}\t${salesCount}`;
      dailyStatistics.table += str + '\n';
    }

    return { statistics, dailyStatistics };
  }

}