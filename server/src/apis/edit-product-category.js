const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');

exports.EditProductCategoryApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
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

  async _updateProductCategory({ productCategoryId, name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable }) {
    let result = await this.database.productCategory._update({ id: productCategoryId }, { name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable });
    console.log("result: ", result);
    this.ensureUpdate('productCategory', result);
  }

  async handle({ body }) {
    let { productCategoryId, name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable } = body;
    // FIXME: fix below method _updateProductCategory
    await this._updateProductCategory({ productCategoryId, name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable });
    return { status: "success" };
  }

}