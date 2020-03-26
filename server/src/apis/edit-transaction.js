const { Api } = require('../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../utils/coded-error');
const { extract } = require('../utils/extract');

exports.EditTransactionApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      transactionId: Joi.number().max(999999999999999).required(),

      transactionDatetimeStamp: Joi.number().max(999999999999999).required(),

      debitList: Joi.array().items(Joi.object().keys({
        accountId: Joi.number().max(999999999999999).required(),
        amount: Joi.number().max(999999999999999).required(),
      })).min(1).required(),

      creditList: Joi.array().items(Joi.object().keys({
        accountId: Joi.number().max(999999999999999).required(),
        amount: Joi.number().max(999999999999999).required(),
      })).min(1).required(),

      note: Joi.string().allow('').max(64).required(),

      note: Joi.string().allow('').max(64).required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: {
        from: "transaction",
        query: ({ transactionId }) => ({ id: transactionId }),
        select: "organizationId",
        errorCode: "TRANSACTION_INVALID"
      },
      privilegeList: [
        "PRIV_MANAGE_ACCOUNTING"
      ],
      moduleList: [
        // TODO: update moduleList with MOD_ACCOUNTING
        // "MOD_ACCOUNTING",
      ]
    }];
  }

  async _updateTransaction({ transactionId, transactionDatetimeStamp, amount, note, debitList, creditList }) {
    let result = await this.database.transaction.setDetailsForManualEntry({ id: transactionId }, {
      transactionDatetimeStamp, amount, note, debitList, creditList
    });
    this.ensureUpdate(result, 'transaction');
    return;
  }

  async handle({ body }) {
    let { transactionId, transactionDatetimeStamp, note, debitList, creditList } = body;
    let { organizationId } = this.interimData;

    // Make sure only manual entries can be edited
    let transaction = await this.database.transaction.findByIdAndOrganizationId({ organizationId, id: transactionId });
    throwOnFalsy(transaction, "TRANSACTION_INVALID", "The transaction could not be found");
    throwOnTruthy(transaction.transactionOrigin === 'system', 'TRANSACTION_NOT_EDITABLE', "System transactions can not be edited manually.");

    if (debitList.length === 1 && creditList.length === 1) {
      throwOnTruthy(debitList[0].accountId === creditList[0].accountId, "TRANSACTION_INVALID", "Cannot do a transaction between same account");
    }

    // make sure amounts are in balance
    let amount = 0;
    {
      let creditSum = 0;
      let debitSum = 0;
      debitList.forEach(({ amount }) => debitSum += amount);
      creditList.forEach(({ amount }) => creditSum += amount);
      throwOnTruthy(debitList[0].accountId === creditList[0].accountId, "TRANSACTION_NOT_BALANCED", "Debit and credit does not match.");
      amount = debitSum;
    }

    await this._updateTransaction({ transactionId, transactionDatetimeStamp, amount, note, debitList, creditList });
    return { status: "success" };
  }

}