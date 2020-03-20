
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');

exports.GetTransactionListApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get autoPaginates() { return ['transactionList']; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required(),
      fromDate: Joi.number().max(999999999999999).required(),
      toDate: Joi.number().max(999999999999999).required(),
      transactionTypeList: Joi.array().items(Joi.string()).default([]).optional(),
      accountIdList: Joi.array().items(Joi.number()).default([]).optional()
    });
  }

  get accessControl() {
    return [{
      // TODO: how to validate accountIdList?
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
    let { organizationId, fromDate, toDate, transactionTypeList, accountIdList } = body;
    let transactionList = [];
    return { transactionList };
  }

}