const { Api } = require('../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../utils/coded-error');
const { extract } = require('../utils/extract');

exports.AddVendorApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required(),

      name: Joi.string().min(1).max(64).required(),
      contactPersonName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required(),
      physicalAddress: Joi.string().min(1).max(128).required(),
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privilegeList: [
        // "PRIV_MODIFY_ALL_PRODUCT_BLUEPRINTS"
      ],
      moduleList: [
        // "MOD_PRODUCT",
      ]
    }];
  }

  async handle({ body }) {
    let { organizationId, name, contactPersonName, phone, physicalAddress } = body;
    let vendorId = await this.database.vendor.create({ organizationId, name, contactPersonName, phone, physicalAddress });
    return { status: "success", vendorId };
  }

}