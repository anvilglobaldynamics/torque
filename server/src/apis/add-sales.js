const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { InventoryMixin } = require('./mixins/inventory-mixin');

exports.AddSalesApi = class extends Api.mixin(InventoryMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({

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
        changeAmount: Joi.number().max(999999999999999).required(),
        shouldSaveChangeInAccount: Joi.boolean().required(),
        paymentMethod: Joi.string().valid('cash', 'card', 'digital', 'change-wallet').required()
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

  _reduceProductCountFromOutletDefaultInventory({ outletDefaultInventory, productList }) {
    for (let product of productList) {
      let foundProduct = outletDefaultInventory.productList.find(_product => _product.productId === product.productId);
      if (!foundProduct) {
        throw new CodedError("PRODUCT_INVALID", "product could not be found in source inventory");
      }
      if (foundProduct.count < product.count) {
        throw new CodedError("INSUFFICIENT_PRODUCT", "not enough product(s) in source inventory");
      }
      foundProduct.count -= product.count;
    }
  }

  async depr_handleReceivedPayment({ payment, customer }) {
    if (payment.totalBilled > payment.paidAmount) {
      if (customer) {
        await this._adjustCustomerBalanceAndSave({ customer, action: 'withdrawl', amount: (payment.totalBilled - payment.paidAmount) });
        return;
      } else {
        throw new CodedError("CREDIT_SALE_NOT_ALLOWED_WITHOUT_CUSTOMER", "credit sale is not allowed without registered cutomer");
      }
    }

    if (payment.totalBilled == payment.paidAmount) {
      return;
    }

    if (payment.totalBilled < payment.paidAmount) {
      if (customer && payment.shouldSaveChangeInAccount) {
        await this._adjustCustomerBalanceAndSave({ customer, action: 'payment', amount: (payment.totalBilled - payment.paidAmount) });
        return;
      } else {
        return;
      }
    }
  }

  async _handleReceivedPayment({ userId, payment, customer }) {
    let paymentList = [
      {
        createdDatetimeStamp: (new Date).getTime(),
        acceptedByUserId: userId,

        paidAmount: payment.paidAmount,
        changeAmount: payment.changeAmount,
        paymentMethod: payment.paymentMethod,
        wasChangeSavedInChangeWallet: false
      }
    ];

    if (payment.totalBilled > payment.paidAmount) {
      // console.log("payment.totalBilled > payment.paidAmount");
      if (customer) {
        await this._adjustCustomerBalanceAndSave({ customer, action: 'withdrawl', amount: (payment.totalBilled - payment.paidAmount) });
      } else {
        throw new CodedError("CREDIT_SALE_NOT_ALLOWED_WITHOUT_CUSTOMER", "credit sale is not allowed without registered cutomer");
      }
    }

    if (payment.totalBilled === payment.paidAmount) {
      // console.log("payment.totalBilled === payment.paidAmount");
    }

    if (payment.totalBilled < payment.paidAmount) {
      // console.log("payment.totalBilled < payment.paidAmount");
      if (customer && payment.shouldSaveChangeInAccount) {
        paymentList[0].wasChangeSavedInChangeWallet = true;

        await this._adjustCustomerBalanceAndSave({ customer, action: 'payment', amount: (payment.totalBilled - payment.paidAmount) });
      }
    }

    let { totalAmount, vatAmount, discountType, discountValue, discountedAmount, serviceChargeAmount, totalBilled } = payment;
    return { totalAmount, vatAmount, discountType, discountValue, discountedAmount, serviceChargeAmount, totalBilled, totalPaidAmount: paymentList[0].paidAmount, paymentList};
  }

  async _adjustCustomerBalanceAndSave({ customer, action, amount }) {
    if (action === 'payment') {
      customer.balance += amount;
    } else if (action === 'withdrawl') {
      customer.balance -= amount;
    }

    await this.database.customer.setBalance({ id: customer.id }, { balance: customer.balance });
    return;
  }

  async handle({ userId, body }) {
    let { outletId, customerId, productList, payment } = body;
    
    let customer = null;
    if (customerId) {
      customer = await this.database.customer.findById({ id: customerId });
      if (!customer) {
        throw new CodedError("CUSTOMER_INVALID", "Customer not found.");
      }
    }

    let outletDefaultInventory = await this.__getOutletDefaultInventory({ outletId });
    this._reduceProductCountFromOutletDefaultInventory({ outletDefaultInventory, productList });
    let standardizedPayment = await this._handleReceivedPayment({ userId, payment, customer });
    // console.log("standardizedPayment: ", standardizedPayment);
    await this.database.inventory.setProductList({ id: outletDefaultInventory.id }, { productList: outletDefaultInventory.productList });
    let salesId = await this.database.sales.create({ outletId, customerId, productList, payment: standardizedPayment });

    return { status: "success", salesId };
  }

}