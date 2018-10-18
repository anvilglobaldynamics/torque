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
    let productBlueprintIdList = newProductList.map(product => product.productBlueprintId);
    let productBlueprintList = await this.database.productBlueprint.listByIdList({ idList: productBlueprintIdList });
    throwOnFalsy(productBlueprintList.length, "PRODUCT_BLUEPRINT_INVALID", "Unable to find all product blueprints");

    for (let productBlueprint of productBlueprintList) {
      throwOnFalsy(productBlueprint.isReturnable, "PRODUCT_BLUEPRINT_NON_RETURNABLE", "product in list is non-returnable");
    }

    return;
  }

  async _updateProduct({ productId, purchasePrice, salePrice }) {
    let result = await this.database.product.setDetails({ id: productId }, { purchasePrice, salePrice });
    this.ensureUpdate(result, 'product');
  }

}