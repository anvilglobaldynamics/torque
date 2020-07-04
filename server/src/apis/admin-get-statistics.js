
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
      products: {
        total: 0
      },
      users: {
        total: 0,
      },
      customers: {
        total: 0
      },
      receipts: {
        total: 0,
        noReceipt: 0,
        byEmail: 0,
        byOwnSms: 0,
        printed: 0
      },
      urlHits: {}
    };

    // products
    let productList = await this.database.product._find({});
    statistics.products.total = productList.length;

    // users
    let userList = await this.database.user._find({});
    statistics.users.total = userList.length;

    // // NOTE: Uncomment to show hasAtLeast1Sale and hasAtLeast5Sales
    // for (let user of userList) {
    //   // because on lipi lite, there is only one owner and they are the one accepting payment.
    //   let salesList = await this.database.sales._find({ originApp: 'torque-lite', "payment.paymentList.acceptedByUserId": user.id });

    //   if (salesList.length > 1) {
    //     statistics.users.hasAtLeast1Sale += 1;
    //   }

    //   if (salesList.length >= 5) {
    //     let salesIdList = salesList.map(i => i.id);
    //     let receiptList = await this.database.receipt._find({ salesId: { $in: salesIdList }, sentHistory: { $ne: [] } });
    //     if (receiptList.length >= 5) {
    //       statistics.users.hasAtLeast5Sales += 1;
    //     }
    //   }
    // }

    // receipts
    let receiptList = await this.database.receipt._find({});
    statistics.receipts.total = receiptList.length;
    receiptList.forEach(receipt => {
      if (receipt.sentHistory.length === 0) {
        statistics.receipts.noReceipt += 1;
        return;
      }
      if (receipt.sentHistory[0].sentVia === 'email') {
        statistics.receipts.byEmail += 1;
      } else if (receipt.sentHistory[0].sentVia === 'print') {
        statistics.receipts.printed += 1;
      } else {
        statistics.receipts.byOwnSms += 1;
      }
    });

    // customers
    let customerList = await this.database.customer._find({});
    statistics.customers.total = customerList.length;

    // urlHists
    let urlAnalytics = await this.database.urlAnalytics._find({ which: 'only' });
    if (urlAnalytics.length > 0) {
      statistics.urlHits = urlAnalytics[0].urlHits;

      for (let key in statistics.urlHits) {
        if ('shouldShowInAdminStatistics' in statistics.urlHits[key]) {
          if (statistics.urlHits[key].shouldShowInAdminStatistics === false) {
            delete statistics.urlHits[key]
          } else {
            delete statistics.urlHits[key].shouldShowInAdminStatistics
          }
        }
      }

      for (let key in statistics.urlHits) {
        let stamp = statistics.urlHits[key].lastHitDatetimeStamp;
        delete statistics.urlHits[key].lastHitDatetimeStamp;

        let date = (new Date(stamp));
        date.setHours(date.getHours() + 6); // timezone
        statistics.urlHits[key].lastHit = date.toISOString();
      }

      let temp = statistics.urlHits;
      let newObj = {};
      let keys = Object.keys(temp);
      keys.sort();
      keys.forEach(key => {
        newObj[key] = temp[key];
      });
      statistics.urlHits = newObj;
    }

    // For 1 time use:
    // {
    //   let startDate = new Date('2019-04-01');
    //   for (let i = 0; i < (16); i++) {
    //     let endDate = new Date(startDate.getTime());
    //     endDate.setMonth(startDate.getMonth() + 1);
    //     endDate.setDate(endDate.getDate() - 1);

    //     let userCount = (await this.database.engine._db.collection('user').aggregate([
    //       {
    //         $match: {
    //           createdDatetimeStamp: {
    //             $gte: startDate.getTime(),
    //             $lte: endDate.getTime()
    //           }
    //         }
    //       },
    //     ]).sort({ count: -1 }).toArray()).length;

    //     // console.log(startDate.toDateString(), endDate.toDateString(), userCount);

    //     let year = startDate.getFullYear();
    //     let monthName = startDate.toLocaleString('default', { month: 'long' });

    //     console.log(year, monthName + ',', userCount);

    //     startDate.setMonth(startDate.getMonth() + 1);

    //   }
    // }

    // console.log("QSTART END")

    // Daily Statistics
    let dailyStatistics = {
      table: 'Date\t\tDAU\tSales\tRegister\n'
    };

    // let startDate = new Date('2019-11-01');
    // let endDate = new Date('2019-11-30');

    let endDate = new Date(new Date().toISOString().split('T')[0]); // Get today without time.
    endDate.setDate(endDate.getDate() - 1); // exclude today

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
            createdDatetimeStamp: {
              $gte: date.getTime(),
              $lte: dateWithEndTime.getTime()
            }
          }
        },
      ]).sort({ count: -1 }).toArray()).length;

      collectionName = 'user';
      let userCount = (await this.database.engine._db.collection(collectionName).aggregate([
        {
          $match: {
            createdDatetimeStamp: {
              $gte: date.getTime(),
              $lte: dateWithEndTime.getTime()
            }
          }
        },
      ]).sort({ count: -1 }).toArray()).length;

      let str = `"${dateString}"\t${dauCount}\t${salesCount}\t${userCount}`;
      dailyStatistics.table += str + '\n';
    }

    return { statistics, dailyStatistics };
  }

}