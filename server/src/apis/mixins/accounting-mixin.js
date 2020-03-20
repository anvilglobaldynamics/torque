const { Api } = require('./../../api-base');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../../utils/coded-error');

/** @param {typeof Api} SuperApiClass */
exports.AccountingMixin = (SuperApiClass) => class extends SuperApiClass {

  async createDefaultAccounts({ organizationId }) {

    const defaultAccountList = [
      {
        codeName: "SALES_REVENUE",
        displayName: "Sales Revenue",
        isMonetaryAccount: false,
        note: "All revenue generated from Sales"
      }
    ];

    for (let i = 0; i < defaultAccountList.length; i++) {
      let account = { isDefaultAccount: true, organizationId };
      Object.assign(account, defaultAccountList[i]);
      let accountId = await this.database.account.create(account);
    }

  }

}