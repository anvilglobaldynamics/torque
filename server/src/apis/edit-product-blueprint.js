const { Api } = require('../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../utils/coded-error');
const { extract } = require('../utils/extract');
const { ProductBlueprintMixin } = require('./mixins/product-blueprint-mixin');

exports.EditProductBlueprintApi = class extends Api.mixin(ProductBlueprintMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      productBlueprintId: Joi.number().max(999999999999999).required(),

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
      organizationBy: {
        from: "product-blueprint",
        query: ({ productBlueprintId }) => ({ id: productBlueprintId }),
        select: "organizationId",
        errorCode: "PRODUCT_BLUEPRINT_INVALID"
      },
      privilegeList: [
        "PRIV_MODIFY_ALL_PRODUCT_BLUEPRINTS"
      ],
      moduleList: [
        "MOD_PRODUCT",
      ]
    }];
  }

  async _updateProductBlueprint({ productBlueprintId, name, unit, identifierCode, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable }) {
    let result = await this.database.productBlueprint.setDetails({ id: productBlueprintId }, { name, unit, identifierCode, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable });
    this.ensureUpdate(result, 'product-blueprint');
  }

  async handle({ body }) {
    let { productBlueprintId, name, unit, identifierCode, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable } = body;
    await this._updateProductBlueprint({ productBlueprintId, name, unit, identifierCode, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable });
    return { status: "success" };
  }

}