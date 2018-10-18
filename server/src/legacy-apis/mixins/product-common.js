
exports.productCommonMixin = (SuperApiClass) => class extends SuperApiClass {

  _verifyProductsExist({ productList }, cbfn) {
    let productIdList = productList.map(product => product.productId);
    this.legacyDatabase.product.findByIdList({ idList: productIdList }, (err, _productList) => {
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
    this.legacyDatabase.product.findByIdList({ idList: productIdList }, (err, _productList) => {
      let productBlueprintIdList = _productList.map(product => product.productBlueprintId);
      this.legacyDatabase.productBlueprint.listByIdList({ idList: productBlueprintIdList }, (err, productBlueprintList) => {
        if (err) return this.fail(err);
        for (let productBlueprint of productBlueprintList) {
          if (productBlueprint.isReturnable == false) {
            err = new Error("product in list is non-returnable");
            err.code = "PRODUCT_BLUEPRINT_NON_RETURNABLE";
            return this.fail(err);
          }
        }
        return cbfn();
      });
    });
  }

  _verifyProductBlueprintsExist({ productList }, cbfn) {
    let productBlueprintIdList = productList.map(product => product.productBlueprintId);
    this.legacyDatabase.productBlueprint.listByIdList({ idList: productBlueprintIdList }, (err, _productList) => {
      if (err) return this.fail(err);
      if (productList.length !== _productList.length) {
        err = new Error("Unable to find all products in productList");
        err.code = "PRODUCT_BLUEPRINT_INVALID";
        return this.fail(err);
      }
      return cbfn();
    });
  }

}