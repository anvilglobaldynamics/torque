
exports.productCommonMixin = (SuperApiClass) => class extends SuperApiClass {

  _verifyProductsExist({ productList }, cbfn) {
    let productIdList = productList.map(product => product.productId);
    this.database.product.findByIdList({ idList: productIdList }, (err, _productList) => {
      if (err) return this.fail(err);
      if (productList.length !== _productList.length) {
        err = new Error("Unable to find all products in productList");
        err.code = "PRODUCT_INVALID";
        return this.fail(err);
      }
      return cbfn();
    });
  }

  _verifyProductsAreReturnable({ productList }, cbfn) {
    let productIdList = productList.map(product => product.productId);
    this.database.product.findByIdList({ idList: productIdList }, (err, _productList) => {
      let productCategoryIdList = _productList.map(product => product.productCategoryId);
      this.database.productCategory.listByIdList({ idList: productCategoryIdList }, (err, __productList) => {
        console.log("__productList: ", __productList);
        return cbfn();
      });
    });
  }

  _verifyProductCategoriesExist({ productList }, cbfn) {
    let productCategoryIdList = productList.map(product => product.productCategoryId);
    this.database.productCategory.listByIdList({ idList: productCategoryIdList }, (err, _productList) => {
      if (err) return this.fail(err);
      if (productList.length !== _productList.length) {
        err = new Error("Unable to find all products in productList");
        err.code = "PRODUCT_CATEGORY_INVALID";
        return this.fail(err);
      }
      return cbfn();
    });
  }

}