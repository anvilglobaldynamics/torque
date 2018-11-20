const { Api } = require('../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../utils/coded-error');
const { extract } = require('../utils/extract');

exports.EditCustomerApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
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

  async handle({ body }) {
    let { customerId, fullName, phone } = body;
    let result = await this.database.customer.setProfile({ id: customerId }, {  fullName, phone });
    this.ensureUpdate(result, 'customer');
    return { status: "success" };
  }

}