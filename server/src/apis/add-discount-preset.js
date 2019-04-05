const { Api } = require('../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../utils/coded-error');
const { extract } = require('../utils/extract');

exports.AddDiscountPresetApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required(),

      name: Joi.string().min(1).max(64).required(),
      discountType: Joi.string().valid('percent', 'fixed').required(),
      discountValue: Joi.number().max(999999999999999).required(),
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privilegeList: [
        "PRIV_MODIFY_DISCOUNT_PRESETS"
      ]
    }];
  }

  async handle({ body }) {
    let { organizationId, name, discountType, discountValue } = body;
    if (discountType === 'percent' && discountValue > 100) {
      throw new CodedError("DISCOUNT_PRESET_INVALID", "Discount percent can not be more than 100");
    }
    let discountPresetId = await this.database.discountPreset.create({ organizationId, name, discountType, discountValue });
    return { status: "success", discountPresetId };
  }

}