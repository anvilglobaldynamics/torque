
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { AccountingMixin } = require('./mixins/accounting-mixin');

exports.GetTransactionListApi = class extends Api.mixin(AccountingMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get autoPaginates() { return ['transactionList']; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required(),

      fromDate: Joi.number().max(999999999999999).allow(null).required(),
      toDate: Joi.number().max(999999999999999).allow(null).required(),

      preset: Joi.string().valid('all-expenses', 'all-revenues', 'all-assets', 'all-payables', 'all-receivables', 'query', 'single', 'only-manual').required(),
      accountIdList: Joi.array().items(Joi.number()).default([]).required(), // it is overriden by 'preset` unless 'preset' === 'query'

      filterByParty: Joi.object().keys({
        collectionName: Joi.string().min(1).max(32).required(),
        documentId: Joi.number().max(999999999999999).required()
      }).allow(null).required(),

      includeOpeningBalance: Joi.boolean().required(),

      transactionId: Joi.number().allow(null).required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privilegeList: [
        "PRIV_MANAGE_ACCOUNTING"
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

  async __includeOpeningBalance({ organizationId, accountIdList, originalFromDate, preset, account, transactionList }) {
    if (account.nature === 'revenue' || account.nature === 'expense') {
      // No opening balance for revenue and expense accounts
      return;
    }

    // get past transactions
    let toDate = originalFromDate - (24 * 60 * 60 * 1000);
    toDate = this.__getExtendedToDate(toDate);
    let pastTransactionList = await this.database.transaction.listByFilters({ organizationId, accountIdList, fromDate: 0, toDate, preset });

    // determine whether the main account balance is debit or credit
    let isBalanceDebit = false;
    if (account.nature === 'asset' || account.nature === 'expense') isBalanceDebit = true;

    // prepare data for preview and compute balance
    let balance = 0;
    pastTransactionList.forEach((transaction) => {
      let isAccountDebited = transaction.debitList.find(({ accountId }) => accountId === account.id);
      console.log({ isAccountDebited })

      if (isAccountDebited) {
        if (isBalanceDebit) {
          balance += transaction.amount;
        } else {
          balance -= transaction.amount;
        }
      } else {
        if (isBalanceDebit) {
          balance -= transaction.amount;
        } else {
          balance += transaction.amount;
        }
      }
    });

    if (balance === 0) return;

    // push 1 entry dynamically into transactionList
    transactionList.push({
      id: null,
      transactionNumber: ' ',

      transactionDatetimeStamp: originalFromDate,
      note: "Opening Balance (Carried forward)",
      organizationId,

      amount: balance,
      transactionOrigin: 'system',

      debitList: [{
        accountId: account.id,
        amount: (isBalanceDebit ? balance : 0)
      }],

      creditList: [{
        accountId: account.id,
        amount: (isBalanceDebit ? 0 : balance)
      }],

      party: null,
      action: null,

      isDeleted: false
    })
  }

  async handle({ body }) {
    let { organizationId, fromDate, toDate, preset, accountIdList, filterByParty, transactionId, includeOpeningBalance } = body;

    toDate = this.__getExtendedToDate(toDate);

    // if preset is single, return only the transaction
    if (preset === 'single') {
      let transaction = await this.database.transaction.findByIdAndOrganizationId({ id: transactionId, organizationId });
      return { transactionList: [transaction] };
    }

    // validate accountIdList
    if (preset === 'query' && accountIdList.length > 0) {
      await this.validateAccountIdList({ organizationId, accountIdList });
    }

    // apply presets (override accountIdList if provided)
    if (preset === 'all-receivables') {
      let account = await this.getAccountByCodeName({ organizationId, codeName: "ACCOUNTS_RECEIVABLE" });
      accountIdList = [account.id];
    } else if (preset === 'all-payables') {
      let account = await this.getAccountByCodeName({ organizationId, codeName: "ACCOUNTS_PAYABLE" });
      accountIdList = [account.id];
    } else if (preset === 'all-expenses') {
      let accountList = await this.database.account._find({ organizationId, nature: 'expense' });
      accountIdList = accountList.map(account => account.id);
    } else if (preset === 'all-revenues') {
      let accountList = await this.database.account._find({ organizationId, nature: 'revenue' });
      accountIdList = accountList.map(account => account.id);
    } else if (preset === 'all-assets') {
      let accountList = await this.database.account._find({ organizationId, nature: 'asset', isMonetaryAccount: false });
      accountIdList = accountList.map(account => account.id);
    }

    // list all transactions
    let transactionList = await this.database.transaction.listByFilters({ organizationId, accountIdList, fromDate, toDate, preset, filterByParty });

    // calculate opening balance if required
    if (includeOpeningBalance) {
      let account = await this.database.account.findByIdAndOrganizationId({ organizationId, id: accountIdList[0] });

      await this.__includeOpeningBalance({
        organizationId, accountIdList, originalFromDate: fromDate, preset, account, transactionList
      });

    }

    return { transactionList };
  }

}