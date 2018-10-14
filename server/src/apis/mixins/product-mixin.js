const { Api } = require('./../../api-base');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../../utils/coded-error');

/** @param {typeof Api} SuperApiClass */
exports.ProductMixin = (SuperApiClass) => class extends SuperApiClass {

  async __getProduct({ productId }) {
    let product = await this.database.product.findById({ id: productId });
    throwOnFalsy(product, "PRODUCT_INVALID", "product not found");
    return product;
  }
  
  async _verifyProductsExist({ productList }) {
    let productIdList = productList.map(product => product.productId);
    let newProductList = await this.database.product.listByIdList({ idList: productIdList });
    throwOnFalsy(newProductList.length, "PRODUCT_INVALID", "Unable to find all products in productList");
    return;
  }

  async _verifyProductsAreReturnable({ productList }) {
    let productIdList = productList.map(product => product.productId);
    let newProductList = await this.database.product.listByIdList({ idList: productIdList });
    let productCategoryIdList = newProductList.map(product => product.productCategoryId);
    let productCategoryList = await this.database.productCategory.listByIdList({ idList: productCategoryIdList });
    throwOnFalsy(productCategoryList.length, "PRODUCT_CATEGORY_INVALID", "Unable to find all product categories");

    for (let productCategory of productCategoryList) {
      throwOnFalsy(productCategory.isReturnable, "PRODUCT_CATEGORY_NON_RETURNABLE", "product in list is non-returnable");
    }

    return;
  }

  async _updateProduct({ productId, purchasePrice, salePrice }) {
    let result = await this.database.product.setDetails({ id: productId }, { purchasePrice, salePrice });
    this.ensureUpdate(result, 'product');
  }

}