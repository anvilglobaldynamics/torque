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

      debitedAccountId: Joi.number().max(999999999999999).required(),
      creditedAccountId: Joi.number().max(999999999999999).required(),
      amount: Joi.number().max(999999999999999).required(),

      note: Joi.string().allow('').max(64).required(),

      amount: Joi.number().max(999999999999999).required(),
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

  async _updateTransaction({ transactionId, transactionDatetimeStamp, amount, note, debitedAccountId, creditedAccountId }) {
    let result = await this.database.transaction.setDetailsForManualEntry({ id: transactionId }, {
      transactionDatetimeStamp, amount, note, debitedAccountId, creditedAccountId
    });
    this.ensureUpdate(result, 'transaction');
    return;
  }

  async handle({ body }) {
    let { transactionId, transactionDatetimeStamp, amount, note, debitedAccountId, creditedAccountId } = body;
    let { organizationId } = this.interimData;

    // Make sure only manual entries can be edited
    let transaction = await this.database.transaction.findByIdAndOrganizationId({ organizationId, id:transactionId });
    throwOnFalsy(transaction, "TRANSACTION_INVALID", "The transaction could not be found");
    throwOnTruthy(transaction.transactionOrigin === 'system', 'TRANSACTION_NOT_EDITABLE', "System transactions can not be edited manually.");

    await this._updateTransaction({ transactionId, transactionDatetimeStamp, amount, note, debitedAccountId, creditedAccountId });
    return { status: "success" };
  }

}