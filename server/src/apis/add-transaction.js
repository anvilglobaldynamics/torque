const { Api } = require('../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../utils/coded-error');
const { extract } = require('../utils/extract');

exports.AddTransactionApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required(),

      transactionOrigin: Joi.string().valid('system', 'manual', 'add-income', 'add-expense', 'add-asset-purchase').required(),
      transactionDatetimeStamp: Joi.number().max(999999999999999).required(),

      debitedAccountId: Joi.number().max(999999999999999).required(),
      creditedAccountId: Joi.number().max(999999999999999).required(),
      amount: Joi.number().max(999999999999999).required(),

      note: Joi.string().allow('').max(64).required(),

      action: Joi.object().keys({
        name: Joi.string().min(1).max(32).required(),
        collectionName: Joi.string().min(1).max(32).required(),
        documentId: Joi.number().max(999999999999999).required()
      }).allow(null).required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: [
        {
          from: "account",
          query: ({ debitedAccountId }) => ({ id: debitedAccountId }),
          select: "organizationId",
          errorCode: "DEBITED_BY_ACCOUNT_INVALID"
        },
        {
          from: "account",
          query: ({ creditedAccountId }) => ({ id: creditedAccountId }),
          select: "organizationId",
          errorCode: "CREDITED_BY_ACCOUNT_INVALID"
        }
      ],
      privilegeList: [
        "PRIV_MANAGE_ACCOUNTING"
      ],
      moduleList: [
        // TODO: update moduleList with MOD_ACCOUNTING
        // "MOD_ACCOUNTING",
      ]
    }];
  }

  async handle({ body }) {
    let { organizationId, note, amount, transactionDatetimeStamp, transactionOrigin, debitedAccountId, creditedAccountId, action } = body;

    throwOnTruthy(transactionOrigin === 'system', "TRANSACTION_ORIGIN_INVALID", "Transaction type 'system' can not be set from APIs");

    let transactionId = await this.database.transaction.create({
      organizationId, note, amount, transactionDatetimeStamp, transactionOrigin, debitedAccountId, creditedAccountId, action
    })

    return { status: "success", transactionId };
  }

}