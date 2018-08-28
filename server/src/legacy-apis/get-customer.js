let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');

exports.GetCustomerApi = class extends collectionCommonMixin(LegacyApi) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      customerId: Joi.number().max(999999999999999).required()
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
        "PRIV_VIEW_CUSTOMER"
      ]
    }];
  }

  _getCustomer({ customerId }, cbfn) {
    this.legacyDatabase.customer.findById({ customerId }, (err, customer) => {
      if (!this._ensureDoc(err, customer, "CUSTOMER_INVALID", "Customer not found.")) return;
      cbfn(customer);
    });
  }

  handle({ body }) {
    let { customerId } = body;
    this._getCustomer({ customerId }, (customer) => {
      this.success({ customer });
    });
  }

}