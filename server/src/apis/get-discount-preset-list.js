
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');

exports.GetDiscountPresetListApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
    }];
  }

  async __DiscountPresetList({ organizationId }) {
    let discountPresetList = await this.database.discountPreset.listByOrganizationId({ organizationId });
    return discountPresetList;
  }

  async handle({ body }) {
    let { organizationId } = body;
    let discountPresetList = await this.__getDiscountPresetList({ organizationId });
    return { discountPresetList };
  }

}