let { Api } = require('./../api-base');
let Joi = require('joi');

exports.GetAggregatedInventoryDetailsApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      inventoryId: Joi.number().max(999999999999999).required()
    });
  }

  _getProductList(inventoryId, cbfn) {
    this.database.inventory.findById({ inventoryId }, (err, inventory) => {
      if (err) return this.fail(err);
      if (inventory === null) {
        err = new Error("inventory could not be found");
        err.code = "INVENTORY_INVALID"
        return this.fail(err);
      }
      cbfn(inventory.productList)
    })
  }

  _getMatchingProductList(productList, cbfn) {
    let productIdList = productList.map(product => product.productId);
    this.database.product.getByIdList(productIdList, (err, matchingProductList) => {
      if (err) return this.fail(err);
      cbfn(matchingProductList)
    })
  }

  _getmatchingProductCategoryList(matchingProductList, cbfn) {
    let productCategoryIdList = matchingProductList.map(product => product.productCategoryId);
    this.database.productCategory.getByIdList(productCategoryIdList, (err, matchingProductCategoryList) => {
      if (err) return this.fail(err);
      cbfn(matchingProductCategoryList)
    })
  }

  handle({ body }) {
    let { inventoryId } = body;
    this._getProductList(inventoryId, productList => {
      this._getMatchingProductList(productList, matchingProductList => {
        this._getmatchingProductCategoryList(matchingProductList, matchingProductCategoryList => {
          this.success({ productList, matchingProductList, matchingProductCategoryList });
        });
      });
    });
  }

}