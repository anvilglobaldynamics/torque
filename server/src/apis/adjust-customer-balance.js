let { Api } = require('./../api-base');
let Joi = require('joi');

exports.AdjustCustomerBalanceApi = class extends Api {

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

  _getCustomer({ customerId }, cbfn) {
    this.database.customer.findById({ customerId }, (err, customer) => {
      if (err) return this.fail(err);
      if (customer == null) {
        err = new Error("customer does not exist");
        err.code = 'CUSTOMER_INVALID';
        return this.fail(err);
      }
      return cbfn(customer);
    });
  }

  _adjustBalance({ customer, action, balance }, cbfn) {
    if (action === 'payment') {
      customer.balance += balance;
      return cbfn(customer);
    } else if (action === 'withdrawl') {
      customer.balance -= balance;
      return cbfn(customer);
    }
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