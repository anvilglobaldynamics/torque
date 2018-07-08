let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');

exports.DeleteCustomerApi = class extends collectionCommonMixin(LegacyApi) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),
      customerId: Joi.number().max(999999999999999).required(),
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
        "PRIV_MODIFY_CUSTOMER"
      ]
    }];
  }

  _deleteCustomer({ customerId }, cbfn) {
    this._deleteDocById(this.legacyDatabase.customer, { customerId }, cbfn);
  }

  handle({ body }) {
    let { customerId } = body;
    this._deleteCustomer({ customerId }, () => {
      this.success({ status: "success" });
    });
  }

}