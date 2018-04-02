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
      // console.log("inventory: ", inventory);
      cbfn(inventory);
    })
  }

  _getInventoryContainerDetails({ inventory }, cbfn) {
    let inventoryContainerDetails = {
      inventoryContainerId: inventory.inventoryContainerId,
      inventoryContainerType: inventory.inventoryContainerType,
      inventoryContainerName: null
    }
    let _cbfn = (err, inventoryContainer) => {
      if (err) return this.fail(err);
      inventoryContainerDetails.inventoryContainerName = inventoryContainer.name;
      cbfn(inventoryContainerDetails);
    }
    if (inventory.inventoryContainerType === "outlet") {
      this.database.outlet.findById({ outletId: inventory.inventoryContainerId }, _cbfn);
    } else {
      this.database.warehouse.findById({ warehouseId: inventory.inventoryContainerId }, _cbfn);
    }

  }

  _getInventoryDetails({ inventory }, cbfn) {
    let inventoryDetails = {
      inventoryName: inventory.name
    }
    cbfn(inventoryDetails);
  }

  _getMatchingProductList({ productList }, cbfn) {
    // console.log("productList: ", productList);
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
        this._getInventoryDetails({ inventory }, (inventoryDetails) => {
          this._getMatchingProductList({ productList: inventory.productList }, (matchingProductList) => {
            this._getMatchingProductCategoryList({ matchingProductList }, (matchingProductCategoryList) => {
              this.success({ inventoryDetails, inventoryContainerDetails, productList: inventory.productList, matchingProductList, matchingProductCategoryList });
            });
          });
        });
      });
    });
  }

}