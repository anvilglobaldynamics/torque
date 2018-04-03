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
      phone: Joi.string().regex(/^[a-z0-9\+]*$/).min(11).max(15).required(),
      openingBalance: Joi.number().max(999999999999999).required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privileges: [
        "PRIV_MODIFY_CUSTOMER"
      ]
    }];
  }

  _createCustomer({ organizationId, fullName, phone, openingBalance, acceptedByUserId }, cbfn) {
    let customer = {
      organizationId, fullName, phone, openingBalance, acceptedByUserId
    }
    this.database.customer.create(customer, (err, customerId) => {
      if (err) return this.fail(err);
      return cbfn(customerId);
    });
  }

  handle({ body, userId }) {
    let { organizationId, fullName, phone, openingBalance } = body;
    this._createCustomer({ organizationId, fullName, phone, openingBalance, acceptedByUserId: userId }, (customerId) => {
      this.success({ status: "success", customerId });
    });
  }

}

