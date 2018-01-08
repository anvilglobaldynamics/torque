let { Api } = require('./../api-base');
let Joi = require('joi');

exports.AddSalesApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

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

  // FIXME: use inventoryCommonMixin
  _getOutletDefaultInventory(outletId, cbfn) {
    this.database.inventory.listByInventoryContainerId({ inventoryContainerId: outletId }, (err, inventoryList) => {
      if (err) return this.fail(err);
      if (inventoryList.length === 0) {
        err = new Error("Invalid Outlet Or Inventory could not be found");
        err.code = "OUTLET_INVENTORY_INVALID"
        return this.fail(err);
      }
      // let inventory = inventoryList.find(inventory => inventory.type === 'default');
      // let { createdDatetimeStamp, lastModifiedDatetimeStamp, id, name, allowManualTransfer } = inventory;
      // let outletDefaultInventory = { createdDatetimeStamp, lastModifiedDatetimeStamp, id, name, allowManualTransfer };
      let outletDefaultInventory = inventoryList.find(inventory => inventory.type === 'default');
      return cbfn(outletDefaultInventory);
    })
  }

  // FIXME: move to customerCommonMixin
  _getCustomer(customerId, cbfn) {
    this.database.customer.findById({ customerId }, (err, customer) => {
      if (err) return this.fail(err);
      // if (customer === null) {
      //   err = new Error("customer could not be found");
      //   err.code = "CUSTOMER_INVALID";
      //   return this.fail(err);
      // }
      return cbfn(customer);
    });
  }

  _sell(outletDefaultInventory, productList, cbfn) {
    productList.forEach(product => {
      let foundProduct = outletDefaultInventory.productList.find(_product => _product.productId === product.productId);
      if (!foundProduct) {
        err = new Error("product could not be found in source inventory");
        err.code = "PRODUCT_INVALID";
        return this.fail(err);
      }
      if (foundProduct.count < product.count) {
        err = new Error("not enough product(s) in source inventory");
        err.code = "INSUFFICIENT_PRODUCT";
        return this.fail(err);
      }
      foundProduct.count -= product.count;
    });
    cbfn();
  }

  _handlePayment(payment, customer, cbfn) {
    let diff = (payment.paidAmount + payment.previousCustomerBalance) - payment.totalBilled;
    payment.changeAmount = diff;
    if (diff >= 0) {
      return cbfn(payment);
    } else {
      this._adjustCustomerBalance(diff, customer, () => {
        return cbfn(payment);
      });
    }
  }

  _adjustCustomerBalance(diff, customer, cbfn) {
    let balance = diff;
    let customerId = customer.id;
    this.database.customer.updateBalanceOnly({ customerId }, { balance }, (err) => {
      if (err) return this.fail(err);
      return cbfn();
    });
  }

  // FIXME: Move to inventoryCommonMixin
  _updateInventory(outletDefaultInventory, cbfn) {
    let inventoryId = outletDefaultInventory.id;
    let productList = outletDefaultInventory.productList;
    this.database.inventory.updateProductList({ inventoryId }, { productList }, (err) => {
      if (err) return this.fail(err);
      cbfn();
    });
  }

  _addSales(outletId, customerId, productList, payment, cbfn) {
    this.database.sales.create({ outletId, customerId, productList, payment }, (err, salesId) => {
      if (err) return this.fail(err);
      cbfn(salesId);
    })
  }

  handle({ body }) {
    let { salesId, outletId, customerId, productList, payment } = body;

    // FIXME: make below all params obj
    this._getOutletDefaultInventory(outletId, (outletDefaultInventory) => {
      this._getCustomer(customerId, (customer) => {
        this._sell(outletDefaultInventory, productList, () => {
          this._handlePayment(payment, customer, () => {
            this._updateInventory(outletDefaultInventory, () => {
              this._addSales(outletId, customerId, productList, payment, (salesId) => {
                this.success({ status: "success", salesId });
              });
            });
          });
        });
      });
    });
  }

}