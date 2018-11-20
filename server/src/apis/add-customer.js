const { Api } = require('../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../utils/coded-error');
const { extract } = require('../utils/extract');

exports.AddCustomerApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
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

  async handle({ body }) {
    let { organizationId, fullName, phone } = body;
    let customerId = await this.database.customer.create({ organizationId, fullName, phone });
    return { status: "success", customerId };
  }

}