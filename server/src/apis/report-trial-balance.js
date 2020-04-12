const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');

exports.ReportTrialBalanceApi = class extends Api {

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

  async __includeUserInformation({ collectionList }) {
    let map = await this.crossmap({
      source: collectionList,
      sourceKey: 'collectedByUserId',
      target: 'user'
    });
    map.forEach((user, collection) => {
      let { fullName, phone } = user;
      collection.collectedByUser = {
        fullName, phone
      }
    });
  }

  // NOTE: This is needed in order to avoid the initial payment taken during the creation
  // of a sale outside current boundary
  __filterByDateRange({ fromDate, toDate, collectionList }) {
    return collectionList.filter((collection) => {
      return fromDate <= collection.collectedDatetimeStamp && collection.collectedDatetimeStamp <= toDate;
    });
  }

  async handle({ body }) {
    let { organizationId, fromDate, toDate } = body;
    toDate = this.__getExtendedToDate(toDate);

    let transactionList = await this.database.transaction.listByFilters({
      organizationId, accountIdList: [], fromDate: 0, toDate, filter: 'query'
    });

    let accountList = await this.database.account.listByOrganizationId({ organizationId });

    let accountMap = {};

    const getAccount = (accountId) => {
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

    transactionList.forEach(transaction => {
      let { debitList, creditList, transactionDatetimeStamp } = transaction;

      debitList.forEach(debit => {
        let account = getAccount(debit.accountId);
        if ((account.nature === 'revenue' || account.nature === 'expense') && transactionDatetimeStamp < fromDate) {
          return;
        }
        if (account.isDebitBalance) { // balance is debit
          account.balance += debit.amount;
        } else {
          account.balance -= debit.amount;
        }
      });

      creditList.forEach(credit => {
        let account = getAccount(credit.accountId);
        if ((account.nature === 'revenue' || account.nature === 'expense') && transactionDatetimeStamp < fromDate) {
          return;
        }
        if (!(account.isDebitBalance)) { // balance is credit
          account.balance += credit.amount;
        } else {
          account.balance -= credit.amount;
        }
      });

    });

    accountList = Object.keys(accountMap).map(key => accountMap[key]);

    accountList = accountList.filter(account => account.balance > 0);

    let totalDebitBalance = 0;
    let totalCreditBalance = 0;
    accountList.forEach(account => {
      if (account.isDebitBalance) {
        totalDebitBalance += account.balance;
      } else {
        totalCreditBalance += account.balance;
      }
    });

    let retainedEarnings = totalDebitBalance - totalCreditBalance;
    if (retainedEarnings !== 0){
      accountList.push({
        codeName: "RETAINED_EARNINGS", // Not actually an account
        displayName: "Retained Earnings",
        nature:  'equity',
        isMonetaryAccount: false,
        note: '',
        isDefaultAccount: true,
        organizationId,
        balance: retainedEarnings
      });
      totalCreditBalance += retainedEarnings;
    }

    return { accountList, totalDebitBalance, totalCreditBalance };
  }

}