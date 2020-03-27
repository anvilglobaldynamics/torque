
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
        // TODO: update moduleList with MOD_ACCOUNTING
        // "MOD_ACCOUNTING"
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

  async handle({ body }) {
    let { organizationId, fromDate, toDate, preset, accountIdList, transactionId } = body;

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
    let transactionList = await this.database.transaction.listByFilters({ organizationId, accountIdList, fromDate, toDate, preset });

    return { transactionList };
  }

}