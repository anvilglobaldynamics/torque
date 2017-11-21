let { Api } = require('./../api-base');
let Joi = require('joi');

exports.DeleteCustomerApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      customerId: Joi.number().max(999999999999999).required(),
    });
  }

  _editCustomer({ customerId }, cbfn) {
    this.database.customer.delete({ customerId }, (err) => {
      if(err) return this.fail(err);
      return cbfn()
    });
  }

  handle({ body }) {
    let { customerId } = body;
    this._editCustomer({ customerId }, () => {
      this.success({ status: "success" });
    });
  }

}