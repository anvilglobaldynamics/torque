const { Api } = require('../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../utils/coded-error');
const { extract } = require('../utils/extract');
const { AccountingMixin } = require('./mixins/accounting-mixin');

exports.AddTransactionApi = class extends Api.mixin(AccountingMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required(),

      transactionOrigin: Joi.string().valid('system', 'manual', 'add-income', 'add-expense', 'add-asset-purchase', 'debt-payment').required(),
      transactionDatetimeStamp: Joi.number().max(999999999999999).required(),

      debitList: Joi.array().items(Joi.object().keys({
        accountId: Joi.number().max(999999999999999).required(),
        amount: Joi.number().max(999999999999999).required(),
      })).min(1).required(),

      creditList: Joi.array().items(Joi.object().keys({
        accountId: Joi.number().max(999999999999999).required(),
        amount: Joi.number().max(999999999999999).required(),
      })).min(1).required(),

      note: Joi.string().min(3).max(64).required(),

      party: Joi.object().keys({
        collectionName: Joi.string().min(1).max(32).required(),
        documentId: Joi.number().max(999999999999999).required()
      }).allow(null).required(),

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
        // NOTE: We are just validating user input. These lists can only contain 1 item each.
        // TODO: Add validation as done in report-inventory-details.js
        //       Or, Add a common validateAccounts() method in account-mixin.js
        {
          from: "account",
          query: ({ debitList }) => ({ id: debitList[0].accountId }),
          select: "organizationId",
          errorCode: "DEBITED_BY_ACCOUNT_INVALID"
        },
        {
          from: "account",
          query: ({ creditList }) => ({ id: creditList[0].accountId }),
          select: "organizationId",
          errorCode: "CREDITED_BY_ACCOUNT_INVALID"
        }
      ],
      privilegeList: [
        "PRIV_MANAGE_ACCOUNTING"
      ],
      moduleList: [
        "MOD_ACCOUNTING",
      ]
    }];
  }

  async handle({ body, userId }) {
    let { organizationId, note, transactionDatetimeStamp, transactionOrigin, debitList, creditList, party, action } = body;

    // make sure amounts are in balance
    let amount = await this.balanceTransactionAndGetAmount({ debitList, creditList });

    throwOnTruthy(transactionOrigin === 'system', "TRANSACTION_ORIGIN_INVALID", "Transaction type 'system' can not be set from APIs");

    let transactionId = await this.database.transaction.create({
      createdByUserId: userId, organizationId, note, amount, transactionDatetimeStamp, transactionOrigin, debitList, creditList, party, action
    })

    return { status: "success", transactionId };
  }

}