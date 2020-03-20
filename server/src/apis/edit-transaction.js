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

  async _updateTransaction({ transactionId, amount, note }) {
    let result = await this.database.transaction.setDetails({ id: transactionId }, { amount, note });
    this.ensureUpdate(result, 'transaction');
    return;
  }

  async handle({ body }) {
    let { transactionId, amount, note } = body;
    // await this._updateTransaction({ transactionId, amount, note });
    return { status: "success" };
  }

}