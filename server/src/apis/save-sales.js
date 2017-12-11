let { Api } = require('./../api-base');
let Joi = require('joi');

exports.SaveSalesApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      salesId: Joi.number().max(999999999999999).allow(null).required(),

      outletId: Joi.number().max(999999999999999).required(),
      customerId: Joi.number().max(999999999999999).allow(null).required(),

      productList: Joi.array().items(
        Joi.object().keys({
          productId: Joi.number().max(999999999999999).required(),
          count: Joi.number().max(999999999999999).required(),
          discountType: Joi.string().max(1024).required(),
          discountValue: Joi.number().max(999999999999999).required(),
          salePrice: Joi.number().max(999999999999999).required()
        })
      ),

      payment: Joi.object().keys({
        totalAmount: Joi.number().max(999999999999999).required(),
        vatAmount: Joi.number().max(999999999999999).required(),
        discountType: Joi.string().max(1024).required(),
        discountValue: Joi.number().max(999999999999999).required(),
        discountedAmount: Joi.number().max(999999999999999).required(),
        serviceChargeAmount: Joi.number().max(999999999999999).required(),
        totalBilled: Joi.number().max(999999999999999).required(),
        previousCustomerBalance: Joi.number().max(999999999999999).allow(null).required(),
        paidAmount: Joi.number().max(999999999999999).required(),
        changeAmount: Joi.number().max(999999999999999).required()
      })
    });
  }

  _getInventoriesWithId(fromInventoryId, toInventoryId, cbfn) {
    this.database.inventory.getById(fromInventoryId, (err, inventory) => {
      if (err) return this.fail(err);
      if (inventory === null) {
        err = new Error("inventory could not be found");
        err.code = "FROM_INVENTORY_INVALID"
        return this.fail(err);
      }
      let fromInventory = inventory;
      this.database.inventory.getById(toInventoryId, (err, inventory) => {
        if (err) return this.fail(err);
        if (inventory === null) {
          err = new Error("inventory could not be found");
          err.code = "TO_INVENTORY_INVALID"
          return this.fail(err);
        }
        let toInventory = inventory;
        cbfn(fromInventory, toInventory);
      })
    })
  }

  _transfer(fromInventory, toInventory, productList, cbfn) {
    productList.forEach(product => {
      let foundProduct = fromInventory.productList.find(_product => _product.productId === product.productId);
      if (!foundProduct) {
        err = new Error("product could not be found in source inventory");
        err.code = "PRODUCT_INVALID"
        return this.fail(err);
      }
      if (foundProduct.count < product.count) {
        err = new Error("not enough product(s) in source inventory");
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
    });
    cbfn();
  }

  _updateInventories(fromInventory, toInventory, cbfn) {
    this.database.inventory.updateProductList({ inventory: fromInventory }, (err) => {
      if (err) return this.fail();
      this.database.inventory.updateProductList({ inventory: toInventory }, (err) => {
        if (err) return this.fail();
        cbfn();
      });
    });
  }

  handle({ body }) {
    console.log("save-sales: ", body);
    // let { fromInventoryId, toInventoryId, productList } = body;
    // this._getInventoriesWithId(fromInventoryId, toInventoryId, (fromInventory, toInventory) => {
    //   this._transfer(fromInventory, toInventory, productList, () => {
    //     this._updateInventories(fromInventory, toInventory, () => {
    //       this.success();
    //     });
    //   });
    // });

    this.success();
  }

}