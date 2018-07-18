let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');
let { inventoryCommonMixin } = require('./mixins/inventory-common');
let { customerCommonMixin } = require('./mixins/customer-common');

exports.AddSalesApi = class extends inventoryCommonMixin(customerCommonMixin(collectionCommonMixin(LegacyApi))) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      outletId: Joi.number().max(999999999999999).required(),
      customerId: Joi.number().max(999999999999999).allow(null).required(),

      productList: Joi.array().required().min(1).items(
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
        paidAmount: Joi.number().max(999999999999999).required(),
        previousCustomerBalance: Joi.number().max(999999999999999).allow(null).required(),
        paidAmount: Joi.number().max(999999999999999).required(),
        changeAmount: Joi.number().max(999999999999999).required(),
        shouldSaveChangeInAccount: Joi.boolean().required()
      })
    });
  }

  get accessControl() {
    return [{
      organizationBy: [
        {
          from: "outlet",
          query: ({ outletId }) => ({ id: outletId }),
          select: "organizationId",
          errorCode: "OUTLET_INVALID"
        }
      ],
      privileges: [
        "PRIV_ACCESS_POS"
      ]
    }];
  }

  _sell({ outletDefaultInventory, productList }, cbfn) {
    for (let product of productList) {
      let foundProduct = outletDefaultInventory.productList.find(_product => _product.productId === product.productId);
      if (!foundProduct) {
        let err = new Error("product could not be found in source inventory");
        err.code = "PRODUCT_INVALID";
        return this.fail(err);
      }
      if (foundProduct.count < product.count) {
        let err = new Error("not enough product(s) in source inventory");
        err.code = "INSUFFICIENT_PRODUCT";
        return this.fail(err);
      }
      foundProduct.count -= product.count;
    }
    return cbfn();
  }

  _handlePayment({ payment, customer }, cbfn) {
    if (payment.totalBilled > payment.paidAmount) {
      if (customer) {
        this._adjustBalanceAndSave({ customer, action: 'withdrawl', amount: (payment.totalBilled - payment.paidAmount) }, () => {
          return cbfn(payment);
        });
      } else {
        let err = new Error("credit sale is not allowed without registered cutomer");
        err.code = "CREDIT_SALE_NOT_ALLOWED_WITHOUT_CUSTOMER";
        return this.fail(err);
      }
    }
    if (payment.totalBilled == payment.paidAmount) {
      return cbfn(payment);
    }
    if (payment.totalBilled < payment.paidAmount) {
      if (customer && payment.shouldSaveChangeInAccount) {
        this._adjustBalanceAndSave({ customer, action: 'payment', amount: (payment.paidAmount - payment.totalBilled) }, () => {
          return cbfn(payment);
        });
      } else {
        return cbfn(payment);
      }
    }
  }

  _addSales({ outletId, customerId, productList, payment }, cbfn) {
    this.legacyDatabase.sales.create({ outletId, customerId, productList, payment }, (err, salesId) => {
      if (err) return this.fail(err);
      cbfn(salesId);
    })
  }

  handle({ body }) {
    let { salesId, outletId, customerId, productList, payment } = body;

    this._getOutletDefaultInventory({ outletId }, (outletDefaultInventory) => {
      this._getCustomer({ customerId }, (customer) => {
        this._sell({ outletDefaultInventory, productList }, () => {
          this._handlePayment({ payment, customer }, () => {
            this._updateInventory({ inventoryId: outletDefaultInventory.id, productList: outletDefaultInventory.productList }, () => {
              this._addSales({ outletId, customerId, productList, payment }, (salesId) => {
                this.success({ status: "success", salesId });
              });
            });
          });
        });
      });
    });
  }

}