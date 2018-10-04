const { throwOnFalsy, throwOnTruthy, CodedError } = require('../../utils/coded-error');

exports.CustomerMixin = (SuperApiClass) => class extends SuperApiClass {

  async _setCustomerChangeWalletBalance({ customer, changeWalletBalance }) {
    let doc = await this.database.customer.setChangeWalletBalance({ id: customer.id }, { changeWalletBalance });
    throwOnFalsy(doc, "UNABLE_TO_UPDATE_CUSTOMER_CHANGE_WALLET_BALANCE", "Unable to update customer change wallet balance");
    return;
  }
  
}