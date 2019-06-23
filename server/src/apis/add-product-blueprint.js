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
      productCategoryIdList: Joi.array().items(Joi.number()).required(),
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

  async __ensureIdentifierCodeIsUnique({ identifierCode, organizationId }) {
    if (identifierCode.length === 0) return;
    let existingBlueprintList = await this.database.productBlueprint._find({ identifierCode, organizationId });
    throwOnTruthy(existingBlueprintList.length > 0, "INVALID_IDENTIFIER_CODE", "The identifier code is already in use by another product blueprint.");
  }

  async handle({ body }) {
    let { organizationId, name, unit, identifierCode, defaultPurchasePrice, defaultVat, defaultSalePrice, productCategoryIdList, isReturnable } = body;
    await this.__ensureIdentifierCodeIsUnique({ identifierCode, organizationId });
    let productBlueprintId = await this._createProductBlueprint({ organizationId, name, unit, identifierCode, defaultPurchasePrice, defaultVat, defaultSalePrice, productCategoryIdList, isReturnable });
    return { status: "success", productBlueprintId };
  }

}