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
        select: "organizationId",
        errorCode: "INVENTORY_INVALID"
      },
      privileges: [
        "PRIV_VIEW_ALL_INVENTORIES"
      ]
    }];
  }

  _getInventory({ inventoryId }, cbfn) {
    this.database.inventory.findById({ inventoryId }, (err, inventory) => {
      if (err) return this.fail(err);
      if (!this._ensureDoc(err, inventory, "INVENTORY_INVALID", "inventory could not be found")) return;
      cbfn(inventory)
    })
  }

  _getInventoryContainerDetails({ inventory }, cbfn) {
    console.log("inventory: ", inventory);
    let inventoryContainerDetails = { inventoryContainerId: inventory.inventoryContainerId }
    cbfn (inventoryContainerDetails); 
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
    this._getInventory({ inventoryId }, (inventory) => {
      this._getInventoryContainerDetails({ inventory }, (inventoryContainerDetails) => {
        this._getMatchingProductList({ productList: inventory.productList }, (matchingProductList) => {
          this._getMatchingProductCategoryList({ matchingProductList }, (matchingProductCategoryList) => {
            this.success({ inventoryContainerDetails, productList: inventory.productList, matchingProductList, matchingProductCategoryList });
          });
        });
      });
    });
  }

}