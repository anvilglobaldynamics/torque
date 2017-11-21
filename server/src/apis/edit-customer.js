let { Api } = require('./../api-base');
let Joi = require('joi');

exports.EditCustomerApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      customerId: Joi.number().max(999999999999999).required(),

      fullName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().alphanum().min(11).max(14).required()
    });
  }

  _editCustomer({ customerId, fullName, phone }, cbfn) {
    this.database.customer.update({ customerId, fullName, phone }, (err) => {
      if (err) return this.fail(err);
      return cbfn()
    });
  }

  handle({ body }) {
    let { customerId, fullName, phone } = body;
    this._editCustomer({ customerId, fullName, phone }, () => {
      this.success({ status: "success" });
    });
  }

}