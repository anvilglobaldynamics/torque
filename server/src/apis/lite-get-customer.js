const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');

exports.LiteGetCustomerApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).allow(null).required(),
      email: Joi.string().email().min(3).max(30).allow(null).required(),
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privilegeList: [
        "PRIV_VIEW_CUSTOMER"
      ]
    }];
  }

  async _getCustomer({ organizationId, phone, email }) {
    if (phone) {
      return await this.database.customer._findOne({ organizationId, phone });
    } else {
      return await this.database.customer._findOne({ organizationId, email });
    }
  }

  async handle({ body }) {
    let { organizationId, phone, email } = body;

    if (phone === null && email === null) {
      throw new CodedError("EMAIL_OR_PHONE_REQUIRED", "At least email or phone is required");
    }

    let customer = await this._getCustomer({ organizationId, phone, email });
    return { customer };
  }

}