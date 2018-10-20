const { Api } = require('../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../utils/coded-error');
const { extract } = require('../utils/extract');
const { ServiceBlueprintMixin } = require('./mixins/service-blueprint-mixin');

exports.AddServiceBlueprintApi = class extends Api.mixin(ServiceBlueprintMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required(),

      name: Joi.string().min(1).max(64).required(),
      unit: Joi.string().max(64).required(),
      defaultDiscountType: Joi.string().valid('percent', 'fixed').required(),
      defaultDiscountValue: Joi.number().when(
        'defaultDiscountType', {
          is: 'percent',
          then: Joi.number().min(0).max(100).required(),
          otherwise: Joi.number().max(999999999999999).required()
        }
      ),
      defaultPurchasePrice: Joi.number().max(999999999999999).required(),
      defaultVat: Joi.number().max(999999999999999).required(),
      defaultSalePrice: Joi.number().max(999999999999999).required(),
      isReturnable: Joi.boolean().required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privilegeList: [
        "PRIV_MODIFY_ALL_SERVICE_BLUEPRINTS"
      ]
    }];
  }

  async handle({ body }) {
    let { organizationId, name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable } = body;
    let productBlueprintId = await this._createProductBlueprint({ organizationId, name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable });
    return { status: "success", productBlueprintId };
  }

}