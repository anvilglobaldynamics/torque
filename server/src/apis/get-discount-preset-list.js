
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');

exports.GetDiscountPresetListApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get autoPaginates() { return ['discountPresetList']; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required(),
      discountPresetIdList: Joi.array().items(Joi.number()).default([]).optional() 
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
    }];
  }

  async __getDiscountPresetList({ organizationId, discountPresetIdList }) {
    if (discountPresetIdList.length > 0) {
      let discountPresetList = await this.database.discountPreset.listByOrganizationIdAndIdList({ organizationId, idList: discountPresetIdList });
      if (discountPresetList.length !== discountPresetIdList.length) {
        throw new CodedError("DISCOUNT_PRESET_INVALID", "The discount preset you provided is invalid");
      }
      return discountPresetList;
    } else {
      return await this.database.discountPreset.listByOrganizationId({ organizationId });
    }   
  }

  async handle({ body }) {
    let { organizationId , discountPresetIdList} = body;
    let discountPresetList = await this.__getDiscountPresetList({ organizationId, discountPresetIdList });
    return { discountPresetList };
  }

}