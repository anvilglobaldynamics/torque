let { Api } = require('./../api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');

exports.EditCustomerApi = class extends collectionCommonMixin(Api) {

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

  _updateCustomer({ customerId, fullName, phone }, cbfn) {
    this.database.customer.update({ customerId }, { fullName, phone }, (err, wasUpdated) => {
      if (!this._ensureUpdate(err, wasUpdated, "customer")) return;
      return cbfn();
    });
  }

  handle({ body }) {
    let { customerId, fullName, phone } = body;
    this._updateCustomer({ customerId, fullName, phone }, () => {
      this.success({ status: "success" });
    });
  }

}