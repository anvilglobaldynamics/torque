
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
      defaultDiscountType: Joi.string().max(1024).required(),
      defaultDiscountValue: Joi.number().max(999999999999999).required(),
      defaultPurchasePrice: Joi.number().max(999999999999999).required(),
      defaultVat: Joi.number().max(999999999999999).required(),
      defaultSalePrice: Joi.number().max(999999999999999).required()
    });
  }

  _createProductCategory({ organizationId, parentProductCategoryId, name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice }, cbfn) {
    let productCategory = {
      organizationId, parentProductCategoryId, name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice
    }
    this.database.productCategory.create(productCategory, (err, productCategoryId) => {
      if (err) return this.fail(err);
      return cbfn(productCategoryId);
    });
  }

  handle({ body }) {
    let { organizationId, parentProductCategoryId, name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice } = body;
    this._createProductCategory({ organizationId, parentProductCategoryId, name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice }, (productCategoryId) => {
      this.success({ status: "success", productCategoryId });
    });
  }

}