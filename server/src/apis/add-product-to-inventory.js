let { Api } = require('./../api-base');
let Joi = require('joi');

exports.AddProductToInventoryApi = class extends Api {

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

  _addProductToInventory({ inventoryId, productList }, cbfn) {
    let promiseList = [];
    productList.forEach(product => {
      let promise = new Promise((accept, reject) => {
        let { productCategoryId, purchasePrice, salePrice, count } = product
        this.database.product.create({ productCategoryId, purchasePrice, salePrice }, (err, productId) => {
          if (err) return reject(err);
          this.database.inventory.addProduct({ inventoryId }, { productId, count }, (err) => {
            if (err) return reject(err);
            accept();
          });
        });
      });
      promiseList.push(promise);
    });

    Promise.all(promiseList)
      .then(_ => {
        return cbfn();
      })
      .catch(err => {
        return this.fail(err);
      })
  }

  handle({ body, userId }) {
    let { inventoryId, productList } = body;
    this._addProductToInventory({ inventoryId, productList }, () => {
      this.success({ status: "success" });
    });
  }

}