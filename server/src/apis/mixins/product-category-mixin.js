const { Api } = require('./../../api-base');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../../utils/coded-error');

/** @param {typeof Api} SuperApiClass */
exports.ProductCategoryMixin = (SuperApiClass) => class extends SuperApiClass {

  async _createProductCategory({ organizationId, name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable }) {
    return await this.database.productCategory.create({ organizationId, name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable });
  }

  _checkIfDiscountValueIsValid({ defaultDiscountType, defaultDiscountValue, defaultSalePrice, defaultVat }) {
    let salePriceAfterVat = defaultSalePrice + defaultSalePrice * defaultVat / 100;
    if (defaultDiscountValue && defaultDiscountType === 'fixed' && defaultDiscountValue > salePriceAfterVat) {
      throw new CodedError("DISCOUNT_VALUE_INVALID", "the discount value is more than sale price");
    }
    if (defaultDiscountValue && defaultDiscountType === 'percent' && defaultDiscountValue > 100) {
      throw new CodedError("DISCOUNT_VALUE_INVALID", "the discount percentage is more than 100");
    }
  }

  async _verifyProductCategoriesExist({ productList }) {
    await this.crossmap({
      source: productList,
      sourceKey: 'productCategoryId',
      target: 'productCategory',
      onError: (inventory) => { throw new CodedError("PRODUCT_CATEGORY_INVALID", "Unable to find all products in productList"); }
    });
  }

}