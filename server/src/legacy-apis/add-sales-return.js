let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');
let { productCommonMixin } = require('./mixins/product-common');
let { customerCommonMixin } = require('./mixins/customer-common');
let { inventoryCommonMixin } = require('./mixins/inventory-common');
let { salesCommonMixin } = require('./mixins/sales-common');

exports.AddSalesReturnApi = class extends salesCommonMixin(inventoryCommonMixin(customerCommonMixin(productCommonMixin(collectionCommonMixin(LegacyApi))))) {

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

      creditedAmount: Joi.number().max(999999999999999).required(),
      shouldSaveReturnableInChangeWallet: Joi.boolean().required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: [
        {
          from: "sales",
          query: ({ salesId }) => ({ id: salesId }),
          select: "outletId",
          errorCode: "SALES_INVALID"
        },
        {
          from: "outlet",
          query: ({ outletId }) => ({ id: outletId }),
          select: "organizationId"
        }
      ],
      privileges: [
        "PRIV_ACCESS_POS"
      ]
    }];
  }

  _returnProducts({ returnedProductList, outletReturnedInventory }, cbfn) {
    let promiseList = [];
    returnedProductList.forEach(product => {
      let promise = new Promise((accept, reject) => {
        this.legacyDatabase.inventory.addProduct({ inventoryId: outletReturnedInventory.id }, { productId: product.productId, count: product.count }, (err) => {
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

  _calculatePayback({ returnedProductList }, cbfn) {
    let promiseList = [];
    let productIdList = returnedProductList.map(product => product.productId);
    let payment = 0;

    this.legacyDatabase.product.findByIdList({ idList: productIdList }, (err, productList) => {
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

  _addSalesReturn({ salesId, returnedProductList, creditedAmount }, cbfn) {
    this.legacyDatabase.salesReturn.create({ salesId, returnedProductList, creditedAmount }, (err, salesReturnId) => {
      return cbfn(salesReturnId);
    })
  }

  handle({ body }) {
    let { salesId, returnedProductList, creditedAmount } = body;

    this._getSales({ salesId }, (sales) => {
      this._verifyProductsExist({ productList: returnedProductList }, () => {
        this._verifyProductsAreReturnable({ productList: returnedProductList }, () => {
          this._getOutletReturnedInventory({ outletId: sales.outletId }, (outletReturnedInventory) => {
            this._returnProducts({ returnedProductList, outletReturnedInventory }, (outletReturnedInventory) => {
              // this._getCustomer({ customerId: salesId.customerId }, (customer) => {
              // this._calculatePayback({ returnedProductList }, (payment) => {
              // this._handlePayback({ payment, customer }, () => {
              this._addSalesReturn({ salesId, returnedProductList, creditedAmount }, (salesReturnId) => {
                this.success({ status: "success", salesReturnId: salesReturnId });
              });
            });
          });
        });
      });
    });
  }

}