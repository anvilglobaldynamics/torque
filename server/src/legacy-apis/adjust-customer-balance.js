let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');
let { customerCommonMixin } = require('./mixins/customer-common');

exports.AdjustCustomerBalanceApi = class extends collectionCommonMixin(customerCommonMixin(LegacyApi)) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      customerId: Joi.number().max(999999999999999).required(),

      action: Joi.string().valid('payment', 'withdrawl').required(),
      amount: Joi.number().max(999999999999999).required()
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

  // FIXME: This does not need to be async
  _updateAdditionalPaymentHistoryList({ customer, amount, action, acceptedByUserId }, cbfn) {
    let paymentRecord = {
      creditedDatetimeStamp: (new Date).getTime(),
      acceptedByUserId,
      amount,
      action
    }
    customer.additionalPaymentHistory.push(paymentRecord);
    return cbfn(customer);
  }

  _saveAdjustment({ customer }, cbfn) {
    this.legacyDatabase.customer.updateBalance({ customerId: customer.id }, { balance: customer.balance, additionalPaymentHistory: customer.additionalPaymentHistory }, (err) => {
      if (err) return this.fail(err);
      return cbfn()
    });
  }

  handle({ body, userId }) {
    let { customerId, action, amount } = body;
    this._getCustomer({ customerId }, (customer) => {
      this._adjustBalance({ customer, action, amount }, (customer) => {
        this._updateAdditionalPaymentHistoryList({ customer, amount, action, acceptedByUserId: userId }, (customer) => {
          this._saveAdjustment({ customer }, () => {
            this.success({ status: "success" });
          })
        })
      })
    })
  }

}