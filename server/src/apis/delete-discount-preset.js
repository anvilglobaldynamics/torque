const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');

exports.DeleteDiscountPresetApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      discountPresetId: Joi.number().max(999999999999999).required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: {
        from: "discount-preset",
        query: ({ discountPresetId }) => ({ id: discountPresetId }),
        select: "organizationId",
        errorCode: "DISCOUNT_PRESET_INVALID"
      },
      privilegeList: [
        "PRIV_MODIFY_DISCOUNT_PRESETS"
      ]
    }];
  }

  async handle({ body }) {
    let { discountPresetId } = body;
    let results = await this.database.discountPreset.deleteById({ id: discountPresetId });
    throwOnFalsy(results, "UNABLE_TO_DELETE_DISCOUNT_PRESET", "Unable to delete discountPreset.");
    return { status: 'success' };
  }

}