const { Api } = require('../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../utils/coded-error');
const { extract } = require('../utils/extract');
const { CustomerMixin } = require('./mixins/customer-mixin');

exports.AddCustomerApi = class extends Api.mixin(CustomerMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required(),

      fullName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).allow(null).required(),
      email: Joi.string().email().min(3).max(30).allow(null).required(),
      address: Joi.string().min(1).max(128).allow('').required(),
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

  async handle({ body }) {
    let { organizationId, fullName, phone, email, address } = body;
    await this.ensureEmailOrPhoneIsProvided({ phone, email });
    let customerId = await this.database.customer.create({ organizationId, fullName, phone, email, address });
    return { status: "success", customerId };
  }

}