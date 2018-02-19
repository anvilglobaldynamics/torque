let { Api } = require('./../api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');
let { customerCommonMixin } = require('./mixins/customer-common');

exports.AdjustCustomerBalanceApi = class extends collectionCommonMixin(customerCommonMixin(Api)) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      customerId: Joi.number().max(999999999999999).required(),

      action: Joi.string().valid('payment', 'withdrawl').required(),
      balance: Joi.number().max(999999999999999).required()
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
  _updateAdditionalPaymentHistoryList({ customer, balance }, cbfn) {
    let paymentRecord = {
      creditedDatetimeStamp: (new Date).getTime(),
      acceptedByUserId: null,
      amount: balance
    }
    customer.additionalPaymentHistory.push(paymentRecord);
    return cbfn(customer);
  }

  _saveAdjustment({ customer }, cbfn) {
    this.database.customer.updateBalance({ customerId: customer.id }, { balance: customer.balance, additionalPaymentHistory: customer.additionalPaymentHistory }, (err) => {
      if (err) return this.fail(err);
      return cbfn()
    });
  }

  handle({ body }) {
    let { customerId, action, balance } = body;
    this._getCustomer({ customerId }, (customer) => {
      this._adjustBalance({ customer, action, balance }, (customer) => {
        this._updateAdditionalPaymentHistoryList({ customer, balance }, (customer) => {
          this._saveAdjustment({ customer }, () => {
            this.success({ status: "success" });
          })
        })
      })
    })
  }

}