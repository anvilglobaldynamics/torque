const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { InventoryMixin } = require('./mixins/inventory-mixin');
const { CustomerMixin } = require('./mixins/customer-mixin');
const { SalesMixin } = require('./mixins/sales-mixin');

exports.AddSalesApi = class extends Api.mixin(InventoryMixin, CustomerMixin, SalesMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({

      outletId: Joi.number().max(999999999999999).required(),
      customerId: Joi.number().max(999999999999999).allow(null).required(),

      productList: Joi.array().min(1).items(
        Joi.object().keys({
          productId: Joi.number().max(999999999999999).required(),
          count: Joi.number().max(999999999999999).required(),
          discountType: Joi.string().max(1024).required(),
          discountValue: Joi.number().max(999999999999999).required(),
          salePrice: Joi.number().max(999999999999999).required(),
          vatPercentage: Joi.number().max(999999999999999).required(),
        })
      ),

      payment: Joi.object().required().keys({
        totalAmount: Joi.number().max(999999999999999).required(), // means total sale price of all products
        vatAmount: Joi.number().max(999999999999999).required(),
        discountType: Joi.string().valid('percent', 'fixed').required(),
        discountValue: Joi.number().max(999999999999999).required(),
        discountedAmount: Joi.number().max(999999999999999).required(),
        serviceChargeAmount: Joi.number().max(999999999999999).required(),
        totalBilled: Joi.number().max(999999999999999).required(), // this is the final amount customer has to pay (regardless of the method)

        // NOTE: below is a single payment.
        paymentMethod: Joi.string().valid('cash', 'card', 'digital', 'change-wallet').required(),
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
      privilegeList: [
        "PRIV_ACCESS_POS"
      ]
    }];
  }

  async _validateBillingAndPayment({ productList, payment, newPayment, customer }) {
    // TODO: should check if adding product(s) salePrice and modifiers (discountedAmount, serviceChargeAmount) equals totalBilled
    // throw new CodedError("BILL_INACCURATE", "Bill is mathematically inaccurate");
    // Also should validate the new payment portion. i.e. paidAmount > changeAmount etc
    // Also, if paymentMethod is 'change-wallet' then customer must exist
    if (payment.totalBilled > (payment.totalPaidAmount + newPayment.paidAmount)) {
      throwOnFalsy(customer, "CREDIT_SALE_NOT_ALLOWED_WITHOUT_CUSTOMER", "Credit sale is not allowed without a registered cutomer.");
    }
    return;
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

  /**
    @method _standardizePayment
    Splits an original payment received from POS into two separate objects.
      - First one is 'payment' containing the standardized form of payment that can be
        inserted into database.
      - Second one is 'newPayment' containing the only the details of current "payment" provided
        by customer.
      see the signature of the objects returned for more clarification.
  */
  _standardizePayment({ originalPayment }) {
    let {
      totalAmount, vatAmount, discountType, discountValue, discountedAmount, serviceChargeAmount,
      totalBilled,
      paymentMethod, paidAmount, changeAmount, shouldSaveChangeInAccount
    } = originalPayment;

    let payment = {
      totalAmount, vatAmount, discountType, discountValue, discountedAmount, serviceChargeAmount,
      totalBilled,
      paymentList: [], totalPaidAmount: 0
    }

    let newPayment = {
      paymentMethod, paidAmount, changeAmount, shouldSaveChangeInAccount
    }

    return { payment, newPayment };
  }

  async _findCustomerIfSelected({ customerId }) {
    let customer = null;
    if (customerId) {
      customer = await this.database.customer.findById({ id: customerId });
      if (!customer) {
        throw new CodedError("CUSTOMER_INVALID", "Customer not found.");
      }
    }
    return customer;
  }

  async handle({ userId, body }) {
    let { outletId, customerId, productList, payment: originalPayment } = body;

    let customer = await this._findCustomerIfSelected({ customerId });

    let outletDefaultInventory = await this.__getOutletDefaultInventory({ outletId });
    this._reduceProductCountFromOutletDefaultInventory({ outletDefaultInventory, productList });

    let { payment, newPayment } = this._standardizePayment({ originalPayment });
    await this._validateBillingAndPayment({ productList, payment, newPayment, customer });
    payment = await this._processASinglePayment({ userId, customer, payment, newPayment });

    await this.database.inventory.setProductList({ id: outletDefaultInventory.id }, { productList: outletDefaultInventory.productList });
    let salesId = await this.database.sales.create({ outletId, customerId, productList, payment });

    return { status: "success", salesId };
  }

}