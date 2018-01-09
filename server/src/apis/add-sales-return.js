let { Api } = require('./../api-base');
let Joi = require('joi');

exports.AddSalesReturnApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      salesId: Joi.number().max(999999999999999).required(),

      returnedProductList: Joi.array().items(
        Joi.object().keys({
          productId: Joi.number().max(999999999999999).required(),
          count: Joi.number().max(999999999999999).required()
        })
      ),
      creditedAmount: Joi.number().max(999999999999999).required()
    });
  }

  // TODO: accessControl()

  // FIXME: move to salesCommonMixin
  _getSales({ salesId }, cbfn) {
    this.database.sales.findById({ salesId }, (err, sales) => {
      if (err) return this.fail(err);
      if (sales === null) {
        err = new Error("sales not found");
        err.code = "SALES_INVALID";
        return this.fail(err);
      }
      return cbfn(sales);
    });
  }

  _getOutletReturnedInventory({ outletId }, cbfn) {
    this.database.inventory.listByInventoryContainerId({ inventoryContainerId: outletId }, (err, inventoryList) => {
      if (err) return this.fail(err);
      if (inventoryList.length === 0) {
        err = new Error("Invalid Outlet Or Inventory could not be found");
        err.code = "OUTLET_INVENTORY_INVALID"
        return this.fail(err);
      }
      // let inventory = inventoryList.find(inventory => inventory.type === 'default');
      // let { createdDatetimeStamp, lastModifiedDatetimeStamp, id, name, allowManualTransfer } = inventory;
      // let outletReturnedInventory = { createdDatetimeStamp, lastModifiedDatetimeStamp, id, name, allowManualTransfer };
      let outletReturnedInventory = inventoryList.find(inventory => inventory.type === 'returned');
      return cbfn(outletReturnedInventory);
    })
  }

  // FIXME: Better Naming
  _return({ returnedProductList, outletReturnedInventory }, cbfn) {
    let promiseList = [];
    returnedProductList.forEach(product => {
      let promise = new Promise((accept, reject) => {
        this.database.inventory.addProduct({ inventoryId: outletReturnedInventory.id }, { productId: product.productId, count: product.count }, (err) => {
          if (err) return reject(err);
          accept();
        });
      });
      promiseList.push(promise);
    });

    Promise.all(promiseList)
      .then(_ => {
        return cbfn(outletReturnedInventory);
      })
      .catch(err => {
        return this.fail(err);
      })
  }

  // FIXME: move to customerCommonMixin
  _getCustomer({ customerId }, cbfn) {
    this.database.customer.findById({ customerId }, (err, customer) => {
      if (err) return this.fail(err);
      return cbfn(customer);
    });
  }

  _calculatePayback({ returnedProductList }, cbfn) {
    let promiseList = [];
    let productIdList = returnedProductList.map(product => product.productId);
    let payment = 0;

    this.database.product.findByIdList({ idList: productIdList }, (err, productList) => {
      productList.forEach(product => {
        let promise = new Promise((accept, reject) => {
          payment += product.salePrice;
          accept();
        });
        promiseList.push(promise);
      });

      Promise.all(promiseList)
        .then(_ => {
          return cbfn(payment);
        })
        .catch(err => {
          return this.fail(err);
        })
    });
  }

  _handlePayback({ payment, customer }, cbfn) {
    // TODO: will handle customer payback here in the future
  }

  _addSalesReturn({ salesId, returnedProductList, creditedAmount }, cbfn) {
    this.database.salesReturn.create({ salesId, returnedProductList, creditedAmount }, (err, salesReturnId) => {
      return cbfn(salesReturnId);
    })
  }

  // below are copied code

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
      if (err) return this.fail();
      return cbfn();
    });
  }

  handle({ body }) {
    let { salesId, returnedProductList, creditedAmount } = body;

    this._getSales({ salesId }, (sales) => {
      this._getOutletReturnedInventory({ outletId: sales.outletId }, (outletReturnedInventory) => {
        this._return({ returnedProductList, outletReturnedInventory }, (outletReturnedInventory) => {
          // this._getCustomer({ customerId: salesId.customerId }, (customer) => {
          // this._calculatePayback({ returnedProductList }, (payment) => {
          // this._handlePayback({ payment, customer }, () => {
          this._addSalesReturn({ salesId, returnedProductList, creditedAmount }, (salesReturnId) => {
            this.success({ status: "success", salesReturnId: salesReturnId });
          });
        });
      })
    });
  }

}