
let { Api } = require('./../api-base');
let Joi = require('joi');

exports.AddProductCategoryApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      organizationId: Joi.number().max(999999999999999).required(),
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

  _checkAndCreateProductCategory({ organizationId, parentProductCategoryId, name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable }, cbfn) {
    let productCategory = {
      organizationId, parentProductCategoryId, name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable
    }

    if (parentProductCategoryId === null) {
      this._createProductCategory(productCategory, cbfn);
    } else {
      this.database.productCategory.findById({ productCategoryId: parentProductCategoryId }, (err, parentProductCategory) => {
        if (err) return this.fail(err);
        if (parentProductCategory === null) {
          err = new Error("parent product category not found");
          err.code = "PARENT_PRODUCT_CATEGORY_INVALID";
          return this.fail(err);
        }
        this._createProductCategory(productCategory, cbfn);
      })
    }
  }

  _createProductCategory(productCategory, cbfn) {
    this.database.productCategory.create(productCategory, (err, productCategoryId) => {
      if (err) return this.fail(err);
      return cbfn(productCategoryId);
    });
  }

  handle({ body }) {
    let { organizationId, parentProductCategoryId, name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable } = body;
    this._checkAndCreateProductCategory({ organizationId, parentProductCategoryId, name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable }, (productCategoryId) => {
      this.success({ status: "success", productCategoryId });
    });
  }

}