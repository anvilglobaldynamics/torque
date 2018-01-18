let { Api } = require('./../api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');

exports.EditProductCategoryApi = class extends collectionCommonMixin(Api) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),
      productCategoryId: Joi.number().max(999999999999999).required(),

      parentProductCategoryId: Joi.number().max(999999999999999).allow(null).required(),

      name: Joi.string().min(1).max(64).required(),
      unit: Joi.string().max(1024).required(),
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

  _checkAndUpdateProductCategory({ productCategoryId, parentProductCategoryId, name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable }, cbfn) {
    if (parentProductCategoryId === null) {
      this._updateProductCategory({ productCategoryId, parentProductCategoryId, name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable }, cbfn);
    } else {
      this.database.productCategory.findById({ productCategoryId: parentProductCategoryId }, (err, parentProductCategory) => {
        if (!this._ensureDoc(err, parentProductCategory, "PARENT_PRODUCT_CATEGORY_INVALID", "parent product category not found")) return;
        this._updateProductCategory({ productCategoryId, parentProductCategoryId, name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable }, cbfn);
      })
    }
  }

  _updateProductCategory({ productCategoryId, parentProductCategoryId, name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable }, cbfn) {
    this.database.productCategory.update({ productCategoryId }, { parentProductCategoryId, name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable }, (err, wasUpdated) => {
      if (!this._ensureUpdate(err, wasUpdated, "product-category")) return;
      return cbfn();
    });
  }

  handle({ body, userId }) {
    let { productCategoryId, parentProductCategoryId, name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable } = body;
    this._checkAndUpdateProductCategory({ productCategoryId, parentProductCategoryId, name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable }, () => {
      this.success({ status: "success" });
    });
  }

}