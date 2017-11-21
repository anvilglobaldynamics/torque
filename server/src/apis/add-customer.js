let { Api } = require('./../api-base');
let Joi = require('joi');

exports.AddCustomerApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),
      organizationId: Joi.number().max(999999999999999).required(),

      fullName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().alphanum().min(11).max(14).required(),
      openingBalance: Joi.number().max(999999999999999).required()
    });
  }

  _createCustomer({ organizationId, fullName, phone, openingBalance }, cbfn) {
    let customer = {
      organizationId, fullName, phone, openingBalance
    }
    this.database.customer.create(customer, (err, customerId) => {
      if (err) {
        if ('code' in err && err.code === 'DUPLICATE_phone') {
          err = new Error("Provided phone number is already in use");
          err.code = 'PHONE_ALREADY_IN_USE';
        }
        return this.fail(err);
      }
      return cbfn(customerId);
    });
  }

  handle({ body }) {
    let { organizationId, fullName, phone, openingBalance } = body;
    this._createCustomer({ organizationId, fullName, phone, openingBalance }, (customerId) => {
      this.success({ status: "success" });
    });
  }

}

