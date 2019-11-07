
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
      receipts: {
        total: 0,
        noReceipt: 0,
        byEmail: 0,
        byPhone: 0
      }
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
    let receiptList = await this.database.receipt._find({});
    statistics.receipts.total = receiptList.length;
    receiptList.forEach(receipt => {
      if (receipt.sentHistory.length === 0) {
        statistics.receipts.noReceipt += 1;
        return;
      }
      if (receipt.sentHistory[0].sentVia === 'email') {
        statistics.receipts.byEmail += 1;
      } else {
        statistics.receipts.byPhone += 1;
      }
    })

    return { statistics };
  }

}