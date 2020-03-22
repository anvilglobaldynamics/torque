
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

      preset: Joi.string().valid('all-exepnses', 'all-revenues', 'all-payables', 'all-receivables', 'query', 'single').required(),
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

  async handle({ body }) {
    let { organizationId, fromDate, toDate, preset, accountIdList, transactionId } = body;

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
    } else if (preset === 'all-exepnses') {
      let accountList = await this.database.account._find({ nature: 'expense' });
      accountIdList = accountList.map(account => account.id);
    } else if (preset === 'all-revenues') {
      let accountList = await this.database.account._find({ nature: 'revenue' });
      accountIdList = accountList.map(account => account.id);
    }

    // list all transactions
    let transactionList = await this.database.transaction.listByFilters({ organizationId, accountIdList, fromDate, toDate });

    return { transactionList };
  }

}