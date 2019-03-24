const { Api } = require('../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../utils/coded-error');
const { extract } = require('../utils/extract');
const { ProductBlueprintMixin } = require('./mixins/product-blueprint-mixin');

exports.AddProductBlueprintApi = class extends Api.mixin(ProductBlueprintMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required(),

      name: Joi.string().min(1).max(64).required(),
      unit: Joi.string().max(64).required(),
      identifierCode: Joi.string().max(64).allow('').required(),
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
        "PRIV_MODIFY_ALL_PRODUCT_BLUEPRINTS"
      ]
    }];
  }

  async handle({ body }) {
    let { organizationId, name, unit, identifierCode, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable } = body;
    let productBlueprintId = await this._createProductBlueprint({ organizationId, name, unit, identifierCode, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable });
    return { status: "success", productBlueprintId };
  }

}