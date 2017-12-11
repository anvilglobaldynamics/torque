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

  _getOutletDefaultInventor(outletId, cbfn) {
    this.database.inventory.listByInventoryContainerId(outletId, (err, inventoryList) => {
      let outletDefaultInventory;
      inventoryList.forEach(inventory => {
        if (inventory.type === 'default') {
          let { createdDatetimeStamp, lastModifiedDatetimeStamp, id, name, allowManualTransfer } = inventory;
          outletDefaultInventory = { createdDatetimeStamp, lastModifiedDatetimeStamp, id, name, allowManualTransfer };
        }
      });
      cbfn(outletDefaultInventory);
    })
  }

  _getInventoryWithId(inventoryId, cbfn) {
    this.database.inventory.getById(inventoryId, (err, inventory) => {
      if (err) return this.fail(err);
      if (inventory === null) {
        err = new Error("inventory could not be found");
        err.code = "OUTLET_INVENTORY_INVALID"
        return this.fail(err);
      }
      let outletDefaultInventory = inventory;
      cbfn(outletDefaultInventory);
    })
  }

  _getCustomerWithId(customerId, cbfn) {
    this.database.customer.findById({ customerId }, (err, customer) => {
      if (err) return this.fail(err);
      return cbfn(customer);
    });
  }

  _getCustomer({ customerId }, cbfn) {
    this.database.customer.findById({ customerId }, (err, customer) => {
      if (err) return this.fail(err);
      return cbfn(customer);
    });
  }

  _sell(outletDefaultInventory, productList, cbfn) {
    productList.forEach(product => {
      let foundProduct = outletDefaultInventory.productList.find(_product => _product.productId === product.productId);
      if (!foundProduct) {
        err = new Error("product could not be found in source inventory");
        err.code = "PRODUCT_INVALID"
        return this.fail(err);
      }
      if (foundProduct.count < product.count) {
        err = new Error("not enough product(s) in source inventory");
        err.code = "INSUFFICIENT_PRODUCT"
        return this.fail(err);
      }
      foundProduct.count -= product.count;
    });
    cbfn();
  }

  _handlePayment(payment, customer, cbfn) {
    let diff = payment.paidAmount - (payment.totalBilled - payment.previousCustomerBalance);
    if (diff >= 0) {
      payment.changeAmount = diff;
      return cbfn(payment)
    } else {
      _adjustCustomerBalance(diff, customer);
    }
  }

  _adjustCustomerBalance(diff, customer, cbfn) {
    customer.balance = diff;
    return cbfn(customer);
  }

  _updateInventory(outletDefaultInventory, cbfn) {
    this.database.inventory.updateProductList({ inventory: outletDefaultInventory }, (err) => {
      if (err) return this.fail();
      cbfn();
    });
  }

  _saveSales(outletId, customerId, productList, payment, cbfn) {
    this.database.sales.create({ outletId, customerId, productList, payment }, (err) => {
      cbfn();
    })
  }

  handle({ body }) {
    let { salesId, outletId, customerId, productList, payment } = body;

    // FIXME: make below all params obj
    this._getOutletDefaultInventor(outletId, (outletDefaultInventory) => {
      this._getInventoryWithId(outletDefaultInventory.id, (outletDefaultInventory) => {
        this._getCustomerWithId(customerId, (customer) => {
          this._sell(outletDefaultInventory, productList, () => {
            this._handlePayment(payment, customer, () => {
                this._updateInventory(outletDefaultInventory, () => {
                  this._saveSales(outletId, customerId, productList, payment, () => {
                    this.success();
                  })
                })
              })
            })
          })
        })
      })
    })
  }

}