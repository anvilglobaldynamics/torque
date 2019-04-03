const { Api } = require('../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../utils/coded-error');
const { extract } = require('../utils/extract');
const { DiscountPresetMixin } = require('./mixins/service-blueprint-mixin');

exports.EditDiscountPresetApi = class extends Api.mixin(DiscountPresetMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      discountPresetId: Joi.number().max(999999999999999).required(),

      name: Joi.string().min(1).max(64).required(),
      discountType: Joi.string().valid('percent', 'fixed').required(),
      discountValue: Joi.number().max(999999999999999).required(),
    });
  }

  get accessControl() {
    return [{
      organizationBy: {
        from: "discountPreset",
        query: ({ discountPresetId }) => ({ id: discountPresetId }),
        select: "organizationId",
        errorCode: "DISCOUNT_PRESET_INVALID"
      },
      privilegeList: [
        "PRIV_MODIFY_DISCOUNT_PRESETS"
      ]
    }];
  }

  async _updateDiscountPreset({ discountPresetId, name, discountType, discountValue }) {
    let result = await this.database.discountPreset.setDetails({ id: discountPresetId }, { name, discountType, discountValue });
    this.ensureUpdate(result, 'discount-preset');
    return;
  }

  async handle({ body }) {
    let { discountPresetId, name, discountType, discountValue } = body;
    await this._updateDiscountPreset({ discountPresetId, name, discountType, discountValue });
    return { status: "success" };
  }

}