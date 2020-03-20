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

      note: Joi.string().allow('').max(64).required(),
      amount: Joi.number().max(999999999999999).required(),
      transactionType: Joi.string().valid('system', 'manual', 'income', 'expense').required()
    });
  }

  get accessControl() {
    return [{
      // TODO: how to validate debitedAccountId and creditedAccountId?
      organizationBy: "organizationId",
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
    let { organizationId, note, amount, transactionType } = body;
    let transactionId = 0;
    return { status: "success", transactionId };
  }

}