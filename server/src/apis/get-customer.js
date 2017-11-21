let { Api } = require('./../api-base');
let Joi = require('joi');

exports.GetCustomerApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      customerId: Joi.number().max(999999999999999).required()
    });
  }

  _getCustomer({ customerId }, cbfn) {
    this.database.findCustomerByCustomerId({ customerId }, (err, customer) => {
      if(err) return this.fail(err);
      return cbfn(customer);
    });
  }

  handle({ body }) {
    let { customerId } = body;
    this._getCustomer({ customerId }, (customer) => {
      this.success({ customer: customer });
    });
  }

}