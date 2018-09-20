const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');

exports.AddProductCategoryApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required(),

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
      organizationBy: "organizationId",
      privileges: [
        "PRIV_MODIFY_ALL_INVENTORIES"
      ]
    }];
  }

  async _createProductCategory({ organizationId, name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable }) {
    return await this.database.productCategory.create({ organizationId, name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable });
  }

  async _checkIfDiscountValueIsValid({ defaultDiscountType, defaultDiscountValue, defaultSalePrice, defaultVat }) {
    let salePriceAfterVat = defaultSalePrice + defaultSalePrice * defaultVat/100;
    
    if (defaultDiscountValue && defaultDiscountType === 'fixed' && defaultDiscountValue > salePriceAfterVat) {
      throw new CodedError("DISCOUNT_VALUE_INVALID", "not enough product(s) in source inventory");
    }

    return;
  }

  async handle({ body }) {
    let { organizationId, name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable } = body;
    await this._checkIfDiscountValueIsValid({ defaultDiscountType, defaultDiscountValue, defaultSalePrice, defaultVat });
    let productCategoryId = await this._createProductCategory({ organizationId, name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable });
    return { status: "success", productCategoryId };
  }

}