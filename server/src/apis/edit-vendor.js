const { Api } = require('../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../utils/coded-error');
const { extract } = require('../utils/extract');

exports.EditVendorApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      vendorId: Joi.number().max(999999999999999).required(),

      name: Joi.string().min(1).max(64).required(),
      contactPersonName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().min(1).max(64).required(), // is actually an arbitrary string, not just a phone number
      physicalAddress: Joi.string().min(1).max(128).required(),
    });
  }

  get accessControl() {
    return [{
      organizationBy: {
        from: "vendor",
        query: ({ vendorId }) => ({ id: vendorId }),
        select: "organizationId",
        errorCode: "VENDOR_INVALID"
      },
      privilegeList: [
        "PRIV_MODIFY_VENDOR"
      ],
      moduleList: [
        "MOD_VENDOR"
      ]
    }];
  }

  async _updateVendor({ vendorId, name, contactPersonName, phone, physicalAddress }) {
    let result = await this.database.vendor.setDetails({ id: vendorId }, { name, contactPersonName, phone, physicalAddress });
    this.ensureUpdate(result, 'vendor');
    return;
  }

  async handle({ body }) {
    let { vendorId, name, contactPersonName, phone, physicalAddress } = body;
    await this._updateVendor({ vendorId, name, contactPersonName, phone, physicalAddress });
    return { status: "success" };
  }

}