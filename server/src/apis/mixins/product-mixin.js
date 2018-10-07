const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../../utils/coded-error');

exports.ProductMixin = (SuperApiClass) => class extends SuperApiClass {

  async _verifyProductsExist({ productList }) {
    let productIdList = productList.map(product => product.productId);
    let newProductList = await this.database.product.listByIdList({ idList: productIdList });
    throwOnFalsy(newProductList.length, "PRODUCT_INVALID", "Unable to find all products in productList")
    return;
  }

  _verifyProductsAreReturnable({ productList }, cbfn) {
    let productIdList = productList.map(product => product.productId);
    this.legacyDatabase.product.findByIdList({ idList: productIdList }, (err, _productList) => {
      let productCategoryIdList = _productList.map(product => product.productCategoryId);
      this.legacyDatabase.productCategory.listByIdList({ idList: productCategoryIdList }, (err, productCategoryList) => {
        if (err) return this.fail(err);
        for (let productCategory of productCategoryList) {
          if (productCategory.isReturnable == false) {
            err = new Error("product in list is non-returnable");
            err.code = "PRODUCT_CATEGORY_NON_RETURNABLE";
            return this.fail(err);
          }
        }
        return cbfn();
      });
    });
  }

}