
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');

exports.GetVendorListApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get autoPaginates() { return ['vendorList']; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required(),
      searchString: Joi.string().min(0).max(32).allow('').optional(),
      vendorIdList: Joi.array().items(Joi.number()).default([]).optional()
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privilegeList: [
        "PRIV_VIEW_VENDOR"
      ],
      moduleList: [
        "MOD_VENDOR"
      ]
    }];
  }

  async __getVendorList({ organizationId, searchString, vendorIdList }) {
    if (vendorIdList.length > 0) {
      let vendorList = await this.database.vendor.listByOrganizationIdAndIdList({ organizationId, idList: vendorIdList });
      if (vendorList.length !== vendorIdList.length) {
        throw new CodedError("VENDOR_INVALID", "The vendor you provided is invalid");
      }
      return vendorList;
    } else {
      return await this.database.vendor.listByOrganizationIdAndSearchString({ organizationId, searchString });
    }
  }

  async handle({ body }) {
    let { organizationId, searchString, vendorIdList } = body;
    let vendorList = await this.__getVendorList({ organizationId, searchString, vendorIdList });
    return { vendorList };
  }

}