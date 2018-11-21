let { LegacyApi } = require('../legacy-api-base');
let Joi = require('joi');

exports.AddCustomerApi = class extends LegacyApi {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),
      organizationId: Joi.number().max(999999999999999).required(),

      fullName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privilegeList: [
        "PRIV_MODIFY_CUSTOMER"
      ]
    }];
  }

  _createCustomer({ organizationId, fullName, phone }, cbfn) {
    let customer = {
      organizationId, fullName, phone
    }
    this.legacyDatabase.customer.create(customer, (err, customerId) => {
      if (err) return this.fail(err);
      return cbfn(customerId);
    });
  }

  handle({ body, userId }) {
    let { organizationId, fullName, phone } = body;
    this._createCustomer({ organizationId, fullName, phone }, (customerId) => {
      this.success({ status: "success", customerId });
    });
  }

}

