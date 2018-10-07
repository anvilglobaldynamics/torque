const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { CustomerMixin } = require('./mixins/customer-mixin');

exports.WithdrawFromChangeWalletBalanceApi = class extends Api.mixin(CustomerMixin) {

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
        "PRIV_MANAGE_CUSTOMER_DEBT"
      ]
    }];
  }

  async _addToCustomerWithdrawalHistory({ customer, amount, userId }) {
    let withdrawalHistory = customer.withdrawalHistory;
    withdrawalHistory.push({
      creditedDatetimeStamp: (new Date).getTime(),
      byUserId: userId,
      amount
    });

    let doc = await this.database.customer.setWithdrawalHistory({ id: customer.id }, { withdrawalHistory });
    return;
  }

  async handle({ body, userId }) {
    let { customerId, amount } = body;

    let customer = await this.database.customer.findById({ id: customerId });
    await this._deductFromChangeWalletAsPayment({ customer, amount });
    await this._addToCustomerWithdrawalHistory({ customer, amount, userId });

    return { status: "success" };
  }

}