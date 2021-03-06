const { Api } = require('../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../utils/coded-error');
const { extract } = require('../utils/extract');
const { CustomerMixin } = require('./mixins/customer-mixin');

exports.EditCustomerApi = class extends Api.mixin(CustomerMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      customerId: Joi.number().max(999999999999999).required(),

      fullName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).allow(null).required(),
      email: Joi.string().email().min(3).max(30).allow(null).required(),
      address: Joi.string().min(1).max(128).allow('').required()
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

  async handle({ body }) {
    let { customerId, fullName, phone, email, address } = body;
    await this.ensureEmailOrPhoneIsProvided({ phone, email });
    let result = await this.database.customer.setProfile({ id: customerId }, { fullName, phone, email, address });
    this.ensureUpdate(result, 'customer');
    return { status: "success" };
  }

}