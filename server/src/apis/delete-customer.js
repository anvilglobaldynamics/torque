let { Api } = require('./../api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');

exports.DeleteCustomerApi = class extends collectionCommonMixin(Api) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),
      customerId: Joi.number().max(999999999999999).required(),
    });
  }

  _deleteCustomer({ customerId }, cbfn) {
    this._deleteDocById(this.database.customer, { customerId }, cbfn);
  }

  handle({ body }) {
    let { customerId } = body;
    this._deleteCustomer({ customerId }, () => {
      this.success({ status: "success" });
    });
  }

}