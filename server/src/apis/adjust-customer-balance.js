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

  _getCustomerWithId({ customerId }, cbfn) {
    this.database.customer.findById({ customerId }, (err, customer) => {
      if (err) return this.fail(err);
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

  _saveAdjustment({ customer }, cbfn) {
    this.database.customer.updateBalance({ customerId: customer.id, balance: customer.balance }, (err) => {
      if (err) return this.fail(err);
      return cbfn()
    });
  }

  handle({ body }) {
    let { customerId, action, balance } = body;
    this._getCustomerWithId({ customerId }, (customer) => {
      this._adjustBalance({ customer, action, balance }, (customer) => {
        this._saveAdjustment({ customer }, () => {
          this.success({ status: "success" });
        })
      })
    })
  }

}