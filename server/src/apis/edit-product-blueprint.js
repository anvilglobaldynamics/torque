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
      productCategoryIdList: Joi.array().items(Joi.number()).required(),
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

  async _updateProductBlueprint({ productBlueprintId, name, unit, identifierCode, defaultPurchasePrice, defaultVat, defaultSalePrice, productCategoryIdList, isReturnable }) {
    let result = await this.database.productBlueprint.setDetails({ id: productBlueprintId }, { name, unit, identifierCode, defaultPurchasePrice, defaultVat, defaultSalePrice, productCategoryIdList, isReturnable });
    this.ensureUpdate(result, 'product-blueprint');
  }

  async _updateExistingProduct({ productBlueprintId, purchasePrice, salePrice }) {
    let product = await this.database.product.findByProductBlueprintId({ productBlueprintId });
    if (product) {
      let result = await this.database.product.setDetails({ id: product.id }, { purchasePrice, salePrice });
      this.ensureUpdate(result, 'product');
    }
  }

  async __ensureIdentifierCodeIsUnique({ identifierCode, organizationId, productBlueprintId }) {
    if (identifierCode.length === 0) return;
    let existingBlueprintList = await this.database.productBlueprint._find({ identifierCode, organizationId, id: { $ne: productBlueprintId } });
    throwOnTruthy(existingBlueprintList.length > 0, "INVALID_IDENTIFIER_CODE", "The identifier code is already in use by another product blueprint.");
  }

  async handle({ body }) {
    let { productBlueprintId, name, unit, identifierCode, defaultPurchasePrice, defaultVat, defaultSalePrice, productCategoryIdList, isReturnable } = body;
    await this.__ensureIdentifierCodeIsUnique({ identifierCode, organizationId: this.interimData.organization.id, productBlueprintId });
    await this._updateProductBlueprint({ productBlueprintId, name, unit, identifierCode, defaultPurchasePrice, defaultVat, defaultSalePrice, productCategoryIdList, isReturnable });
    await this._updateExistingProduct({ productBlueprintId, purchasePrice: defaultPurchasePrice, salePrice: defaultSalePrice });
    return { status: "success" };
  }

}