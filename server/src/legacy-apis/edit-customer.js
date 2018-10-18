let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');

exports.EditCustomerApi = class extends collectionCommonMixin(LegacyApi) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      customerId: Joi.number().max(999999999999999).required(),

      fullName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required()
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
      privilegeList: [
        "PRIV_MODIFY_CUSTOMER"
      ]
    }];
  }

  _updateCustomer({ customerId, fullName, phone }, cbfn) {
    this.legacyDatabase.customer.update({ customerId }, { fullName, phone }, (err, wasUpdated) => {
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