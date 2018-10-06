const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');

exports.WithdrawFromChangeWalletBalanceApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({

      customerId: Joi.number().max(999999999999999).required(),
      amount: Joi.number().min(1).max(999999999999999).required()

    });
  }

  get accessControl() {
    return [{
      organizationBy: {
        from: "customer",
        query: ({ customerId }) => ({ id: customerId }),
        select: "organizationId",
        errorCode: "CUSTOMER_INVALID"
      },
      privileges: [
        "PRIV_MANAGE_CUSTOMER_WALLET_BALANCE"
      ]
    }];
  }

  async handle({ body, userId }) {
    let { customerId, amount } = body;

    return { status: "success" };
  }

}