let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');

exports.TransferBetweenInventoriesApi = class extends collectionCommonMixin(LegacyApi) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      fromInventoryId: Joi.number().max(999999999999999).required(),
      toInventoryId: Joi.number().max(999999999999999).required(),

      productList: Joi.array().items(
        Joi.object().keys({
          productId: Joi.number().max(999999999999999).required(),
          count: Joi.number().max(999999999999999).required()
        })
      )
    });
  }

  get accessControl() {
    return [
      {
        organizationBy: {
          from: "inventory",
          query: ({ fromInventoryId }) => ({ id: fromInventoryId }),
          select: "organizationId",
          errorCode: "FROM_INVENTORY_INVALID"
        },
        privileges: ["PRIV_TRANSFER_ALL_INVENTORIES"]
      },
      {
        organizationBy: {
          from: "inventory",
          query: ({ toInventoryId }) => ({ id: toInventoryId }),
          select: "organizationId",
          errorCode: "TO_INVENTORY_INVALID"
        },
        privileges: ["PRIV_TRANSFER_ALL_INVENTORIES"]
      }
    ];
  }

  _getInventoriesWithId({ fromInventoryId, toInventoryId }, cbfn) {
    this.legacyDatabase.inventory.findById({ inventoryId: fromInventoryId }, (err, inventory) => {
      if (!this._ensureDoc(err, inventory, "FROM_INVENTORY_INVALID", "Inventory could not be found")) return;
      let fromInventory = inventory;
      this.legacyDatabase.inventory.findById({ inventoryId: toInventoryId }, (err, inventory) => {
        if (!this._ensureDoc(err, inventory, "TO_INVENTORY_INVALID", "Inventory could not be found")) return;
        let toInventory = inventory;
        cbfn(fromInventory, toInventory);
      })
    })
  }

  _transfer({ fromInventory, toInventory, productList }, cbfn) {
    for (let product of productList) {
      let foundProduct = fromInventory.productList.find(_product => _product.productId === product.productId);
      if (!foundProduct) {
        let err = new Error("product could not be found in source inventory");
        err.code = "PRODUCT_INVALID"
        return this.fail(err);
      }
      // TODO: if (!this._ensureDoc(err, foundProduct, "PRODUCT_INVALID", "Product could not be found in source inventory")) return;
      if (foundProduct.count < product.count) {
        let err = new Error("not enough product(s) in source inventory");
        err.code = "PRODUCT_INSUFFICIENT"
        return this.fail(err);
      }
      foundProduct.count -= product.count;

      foundProduct = toInventory.productList.find(_product => _product.productId === product.productId);
      if (!foundProduct) {
        toInventory.productList.push(product);
      } else {
        foundProduct.count += product.count;
      }
    }
    return cbfn();
  }

  _updateInventories({ fromInventory, toInventory }, cbfn) {
    let inventoryId = fromInventory.id;
    let productList = fromInventory.productList;
    this.legacyDatabase.inventory.updateProductList({ inventoryId }, { productList }, (err) => {
      if (err) return this.fail();
      inventoryId = toInventory.id;
      productList = toInventory.productList;
      this.legacyDatabase.inventory.updateProductList({ inventoryId }, { productList }, (err) => {
        if (err) return this.fail();
        cbfn();
      });
    });
  }

  handle({ body }) {
    let { fromInventoryId, toInventoryId, productList } = body;
    this._getInventoriesWithId({ fromInventoryId, toInventoryId }, (fromInventory, toInventory) => {
      this._transfer({ fromInventory, toInventory, productList }, () => {
        this._updateInventories({ fromInventory, toInventory }, () => {
          this.success();
        });
      });
    });
  }

}