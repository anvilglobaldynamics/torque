
exports.productCommonMixin = (SuperApiClass) => class extends SuperApiClass {

  _verifyProductsExist(productList, cbfn) {
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



}