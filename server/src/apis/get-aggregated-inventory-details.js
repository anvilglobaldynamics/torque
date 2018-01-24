let { Api } = require('./../api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');

exports.GetAggregatedInventoryDetailsApi = class extends collectionCommonMixin(Api) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      inventoryId: Joi.number().max(999999999999999).required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: {
        from: "inventory",
        query: ({ inventoryId }) => ({ id: inventoryId }),
        select: "organizationId"
      },
      privileges: [
        "PRIV_VIEW_ALL_INVENTORIES"
      ]
    }];
  }

  _getProductList({ inventoryId }, cbfn) {
    this.database.inventory.findById({ inventoryId }, (err, inventory) => {
      if (!this._ensureDoc(err, inventory, "INVENTORY_INVALID", "inventory could not be found")) return;
      cbfn(inventory.productList)
    })
  }

  _getMatchingProductList({ productList }, cbfn) {
    let productIdList = productList.map(product => product.productId);
    this.database.product.findByIdList({ idList: productIdList }, (err, matchingProductList) => {
      if (err) return this.fail(err);
      cbfn(matchingProductList)
    })
  }

  _getMatchingProductCategoryList({ matchingProductList }, cbfn) {
    let productCategoryIdList = matchingProductList.map(product => product.productCategoryId);
    this.database.productCategory.listByIdList({ idList: productCategoryIdList }, (err, matchingProductCategoryList) => {
      if (err) return this.fail(err);
      cbfn(matchingProductCategoryList)
    })
  }

  handle({ body }) {
    let { inventoryId } = body;
    this._getProductList({ inventoryId }, (productList) => {
      this._getMatchingProductList({ productList }, (matchingProductList) => {
        this._getMatchingProductCategoryList({ matchingProductList }, (matchingProductCategoryList) => {
          this.success({ productList, matchingProductList, matchingProductCategoryList });
        });
      });
    });
  }

}