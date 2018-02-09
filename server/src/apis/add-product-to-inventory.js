let { Api } = require('./../api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');
let { productCommonMixin } = require('./mixins/product-common');

exports.AddProductToInventoryApi = class extends productCommonMixin(collectionCommonMixin(Api)) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      inventoryId: Joi.number().max(999999999999999).required(),

      productList: Joi.array().items(
        Joi.object().keys({
          productCategoryId: Joi.number().max(999999999999999).required(),
          purchasePrice: Joi.number().max(999999999999999).required(),
          salePrice: Joi.number().max(999999999999999).required(),
          count: Joi.number().max(999999999999999).required()
        })
      )
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
        "PRIV_MODIFY_ALL_INVENTORIES"
      ]
    }];
  }

  _addProductToInventory({ inventoryId, productList }, cbfn) {
    Promise.all(productList.map(product => {
      return new Promise((accept, reject) => {
        let { productCategoryId, purchasePrice, salePrice, count } = product
        this.database.product.create({ productCategoryId, purchasePrice, salePrice }, (err, productId) => {
          console.log("productId: ", productId);
          if (err) return reject(err);
          this.database.inventory.addProduct({ inventoryId }, { productId, count }, (err, wasUpdated) => {
            if (!this._ensureUpdate(err, wasUpdated, "inventory")) return;
            accept();
          });
        });
      });
    })).then(_ => {
      return cbfn();
    }).catch(err => {
      return this.fail(err);
    });
  }

  handle({ body, userId }) {
    let { inventoryId, productList } = body;
    this._verifyProductCategoriesExist({ productList }, () => {
      this._addProductToInventory({ inventoryId, productList }, () => {
        this.success({ status: "success" });
      });
    });
  }

}