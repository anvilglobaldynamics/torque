const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');

exports.ReportBalanceSheetApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required(),

      fromDate: Joi.number().max(999999999999999).required(),
      toDate: Joi.number().max(999999999999999).required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privilegeList: [
        "PRIV_VIEW_ACCOUNTING_REPORTS"
      ],
      moduleList: [
        "MOD_ACCOUNTING"
      ]
    }];
  }

  __getExtendedToDate(toDate) {
    toDate = new Date(toDate);
    toDate.setHours(23);
    toDate.setMinutes(59);
    toDate = toDate.getTime();
    return toDate;
  }

  // NOTE: needs local variables. do not move to mixin
  getAccount(accountMap, accountList, accountId) {
    if (!(String(accountId) in accountMap)) {

      let account = accountList.find(account => account.id === accountId);

      throwOnFalsy(account, "ACCOUNT_INVALID", "Account is invalid");

      if (account.nature === 'asset' || account.nature === 'expense') { // balance is debit
        account.isDebitBalance = true;
      } else {
        account.isDebitBalance = false;
      }

      account.balance = 0;
      accountMap[String(accountId)] = account;
    }
    return accountMap[String(accountId)];
  }

  async handle({ body }) {
    let { organizationId, fromDate, toDate } = body;
    toDate = this.__getExtendedToDate(toDate);

    let transactionList = await this.database.transaction.listByFilters({
      organizationId, accountIdList: [], fromDate: 0, toDate, filter: 'query'
    });

    let accountList = await this.database.account.listByOrganizationId({ organizationId });

    let accountMap = {};

    transactionList.forEach(transaction => {
      let { debitList, creditList, transactionDatetimeStamp } = transaction;

      debitList.forEach(debit => {
        let account = this.getAccount(accountMap, accountList, debit.accountId);
        if (!account) return;
        if (account.isDebitBalance) { // balance is debit
          account.balance += debit.amount;
        } else {
          account.balance -= debit.amount;
        }
      });

      creditList.forEach(credit => {
        let account = this.getAccount(accountMap, accountList, credit.accountId);
        if (!account) return;
        if (!(account.isDebitBalance)) { // balance is credit
          account.balance += credit.amount;
        } else {
          account.balance -= credit.amount;
        }
      });

    });

    accountList = Object.keys(accountMap).map(key => accountMap[key]);

    accountList = accountList.filter(account => account.balance > 0);

    // Calculate Retained Earnings
    let revenueList = accountList.filter(account => account.nature === 'revenue');
    let expenseList = accountList.filter(account => account.nature === 'expense');

    let totalRevenue = revenueList.reduce((sum, account) => sum + account.balance, 0);
    let totalExpense = expenseList.reduce((sum, account) => sum + account.balance, 0);

    let retainedEarnings = totalRevenue - totalExpense;
    if (retainedEarnings !== 0) {
      accountList.push({
        codeName: "RETAINED_EARNINGS", // Not actually an account
        displayName: "Retained Earnings",
        nature: 'equity',
        isMonetaryAccount: false,
        note: '',
        isDefaultAccount: true,
        organizationId,
        balance: retainedEarnings
      });
    }

    // List assets, equity and liabilities
    let assetList = accountList.filter(account => account.nature === 'asset');
    let liabilityList = accountList.filter(account => account.nature === 'liability');
    let equityList = accountList.filter(account => account.nature === 'equity');

    let totalAssets = assetList.reduce((sum, account) => sum + account.balance, 0);
    let totalLiabilities = liabilityList.reduce((sum, account) => sum + account.balance, 0);
    let totalEquity = equityList.reduce((sum, account) => sum + account.balance, 0);

    // sort assets
    assetList.sort((a, b) => {
      if (a.codeName === "ACCOUNTS_RECEIVABLES") return -1;
      if (a.isMonetaryAccount) return -1;
      return 0;
    });

    return { assetList, liabilityList, equityList, totalAssets, totalLiabilities, totalEquity };
  }

}