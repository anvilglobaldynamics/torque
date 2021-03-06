const { Api } = require('./../../api-base');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../../utils/coded-error');

/** @param {typeof Api} SuperApiClass */
exports.CustomerMixin = (SuperApiClass) => class extends SuperApiClass {

  async _deductFromChangeWalletAsPayment({ customer, amount }) {
    if (amount < 0) throw new CodedError("NEGATIVE_AMOUNT_GIVEN", "amount cannot be negative");
    if (customer.changeWalletBalance < amount) {
      throw new CodedError("INSUFFICIENT_BALANCE", "Customer does not have enough balance to pay this amount");
    }

    let changeWalletBalance = customer.changeWalletBalance;
    changeWalletBalance -= amount;
    let doc = await this.database.customer.setChangeWalletBalance({ id: customer.id }, { changeWalletBalance });
    throwOnFalsy(doc, "UNABLE_TO_UPDATE_CUSTOMER_CHANGE_WALLET_BALANCE", "Unable to update customer change wallet balance");
  }

  async _addChangeToChangeWallet({ customer, amount }) {
    if (amount < 0) throw new CodedError("NEGATIVE_AMOUNT_GIVEN", "amount cannot be negative");

    let changeWalletBalance = customer.changeWalletBalance;
    changeWalletBalance += amount;
    let doc = await this.database.customer.setChangeWalletBalance({ id: customer.id }, { changeWalletBalance });
    throwOnFalsy(doc, "UNABLE_TO_UPDATE_CUSTOMER_CHANGE_WALLET_BALANCE", "Unable to update customer change wallet balance");
  }

  async _deductFromChangeWalletAsManualWithdrawal({ customer, amount, byUserId }) {
    if (amount < 0) throw new CodedError("NEGATIVE_AMOUNT_GIVEN", "amount cannot be negative");
    if (customer.changeWalletBalance < amount) {
      throw new CodedError("INSUFFICIENT_BALANCE", "Customer does not have enough balance to withdraw this amount");
    }

    let changeWalletBalance = customer.changeWalletBalance;
    changeWalletBalance -= amount;
    let doc = await this.database.customer.setChangeWalletBalance({ id: customer.id }, { changeWalletBalance });
    throwOnFalsy(doc, "UNABLE_TO_UPDATE_CUSTOMER_CHANGE_WALLET_BALANCE", "Unable to update customer change wallet balance");

    let withdrawalHistory = customer.withdrawalHistory;
    withdrawalHistory.push({
      creditedDatetimeStamp: Date.now(),
      byUserId,
      amount
    });
    doc = await this.database.customer.setWithdrawalHistory({ id: customer.id }, { withdrawalHistory });
    throwOnFalsy(doc, "UNABLE_TO_UPDATE_CUSTOMER_CHANGE_WALLET_BALANCE", "Unable to update customer change wallet balance");
  }

  async ensureEmailOrPhoneIsProvided({ phone, email }) {
    if (!phone && !email) {
      throw new CodedError("CUSTOMER_EMAIL_OR_PHONE_REQUIRED", "Customer's email or phone is required.");
    }
    // For Lipi for Business, Customer phone number is required.
    if (this.clientApplication === 'torque') {
      if (!phone) {
        throw new CodedError("PHONE_INVALID", "Customer's phone is required");
      }
    }
  }

  async _createCustomer({ originApp, organizationId, fullName, phone, email, address }) {
    await this.applyGlobalUsageLimit({ useCase: 'add-customer' });
    return await this.database.customer.create({ originApp, organizationId, fullName, phone, email, address });
  }

}