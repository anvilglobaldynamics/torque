let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');

exports.EditProductCategoryApi = class extends collectionCommonMixin(LegacyApi) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),
      productCategoryId: Joi.number().max(999999999999999).required(),

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

  get accessControl() {
    return [{
      organizationBy: {
        from: "product-category",
        query: ({ productCategoryId }) => ({ id: productCategoryId }),
        select: "organizationId",
        errorCode: "PRODUCT_CATEGORY_INVALID"
      },
      privileges: [
        "PRIV_MODIFY_ALL_INVENTORIES"
      ]
    }];
  }

  _checkAndUpdateProductCategory({ productCategoryId, parentProductCategoryId, name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable }, cbfn) {
    if (parentProductCategoryId === null) {
      this._updateProductCategory({ productCategoryId, parentProductCategoryId, name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable }, cbfn);
    } else if (parentProductCategoryId === productCategoryId) {
      let err = new Error("Product Category cannot be it's own parent");
      err.code = "PARENT_PRODUCT_CATEGORY_INVALID";
      return this.fail(err);
    } else {
      this.legacyDatabase.productCategory.findById({ productCategoryId: parentProductCategoryId }, (err, parentProductCategory) => {
        if (!this._ensureDoc(err, parentProductCategory, "PARENT_PRODUCT_CATEGORY_INVALID", "parent product category not found")) return;
        this._updateProductCategory({ productCategoryId, parentProductCategoryId, name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable }, cbfn);
      })
    }
  }

  _updateProductCategory({ productCategoryId, parentProductCategoryId, name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable }, cbfn) {
    this.legacyDatabase.productCategory.update({ productCategoryId }, { parentProductCategoryId, name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable }, (err, wasUpdated) => {
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