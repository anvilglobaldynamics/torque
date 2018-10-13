const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { ProductMixin } = require('./mixins/product-mixin');

exports.EditInventoryProductApi = class extends Api.mixin(ProductMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({

      productId: Joi.number().max(999999999999999).required(),
      purchasePrice: Joi.number().max(999999999999999).required(),
      salePrice: Joi.number().max(999999999999999).required()

    });
  }

  get accessControl() {
    return [{
      organizationBy: {},
      privileges: [
        "PRIV_MODIFY_ALL_PRODUCT"
      ]
    }];
  }

  async handle({ body }) {
    let { productId, purchasePrice, salePrice } = body;
    
    await this._updateProduct({ productId, purchasePrice, salePrice });
    return { status: "success" };
  }

}