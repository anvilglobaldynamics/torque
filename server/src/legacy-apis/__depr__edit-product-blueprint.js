let { LegacyApi } = require('../legacy-api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');

exports.EditProductBlueprintApi = class extends collectionCommonMixin(LegacyApi) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),
      productBlueprintId: Joi.number().max(999999999999999).required(),

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
      organizationBy: {
        from: "product-blueprint",
        query: ({ productBlueprintId }) => ({ id: productBlueprintId }),
        select: "organizationId",
        errorCode: "PRODUCT_BLUEPRINT_INVALID"
      },
      privilegeList: [
        "PRIV_MODIFY_ALL_PRODUCT_BLUEPRINTS"
      ]
    }];
  }

  _checkAndUpdateProductBlueprint({ productBlueprintId, name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable }, cbfn) {
      this._updateProductBlueprint({ productBlueprintId, name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable }, cbfn);
  }

  _updateProductBlueprint({ productBlueprintId, name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable }, cbfn) {
    this.legacyDatabase.productBlueprint.update({ productBlueprintId }, { name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable }, (err, wasUpdated) => {
      if (!this._ensureUpdate(err, wasUpdated, "product-blueprint")) return;
      return cbfn();
    });
  }

  handle({ body, userId }) {
    let { productBlueprintId, name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable } = body;
    this._checkAndUpdateProductBlueprint({ productBlueprintId, name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable }, () => {
      this.success({ status: "success" });
    });
  }

}