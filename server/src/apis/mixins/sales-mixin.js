const { Api } = require('./../../api-base');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../../utils/coded-error');

/** @param {typeof Api} SuperApiClass */
exports.SalesMixin = (SuperApiClass) => class extends SuperApiClass {

  async _getSales({ salesId }) {
    let sales = await this.database.sales.findById({ id: salesId });
    throwOnFalsy(sales, "SALES_INVALID", "Sales not found");
    return sales;
  }

  async _getSalesList({ organizationId, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate }) {
    let outletList = await this.database.outlet.listByOrganizationId({ organizationId });
    let outletIdList = outletList.map(outlet => outlet.id);
    let salesList = await this.database.sales.listByFilters({ outletIdList, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate });
    return salesList;
  }

  async _processASinglePayment({ userId, payment, customer, paymentListEntry }) {
    // NOTE: At this point, all of above fields are validated and completely trustworthy.

    // NOTE: since paidAmount includes changeAmount, we confirmed after discussion.
    let paidAmountWithoutChange = (paymentListEntry.paidAmount - paymentListEntry.changeAmount);

    if (paymentListEntry.paymentMethod === 'change-wallet') {
      await this._deductFromChangeWalletAsPayment({ customer, amount: paidAmountWithoutChange });
    }

    payment.totalPaidAmount += paidAmountWithoutChange;
    let wasChangeSavedInChangeWallet = false;
    if (paymentListEntry.changeAmount && paymentListEntry.shouldSaveChangeInAccount) {
      wasChangeSavedInChangeWallet = true;
      await this._addChangeToChangeWallet({ customer, amount: paymentListEntry.changeAmount });
    }

    let {
      paymentMethod, paidAmount, changeAmount
    } = paymentListEntry;

    payment.paymentList.push({
      createdDatetimeStamp: Date.now(),
      acceptedByUserId: userId,
      paymentMethod, paidAmount, changeAmount,
      wasChangeSavedInChangeWallet
    });

    return payment;
  }

}