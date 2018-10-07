const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { InventoryMixin } = require('./mixins/inventory-mixin');
const { CustomerMixin } = require('./mixins/customer-mixin');

exports.AddAdditionalSalesApi = class extends Api.mixin(InventoryMixin, CustomerMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      salesId: Joi.number().max(999999999999999).required(),
      customerId: Joi.number().max(999999999999999).required(),
      payment: Joi.object().keys({
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

  async _processASinglePayment({ userId, payment, customer, newPayment }) {
    // NOTE: At this point, all of above fields are validated and completely trustworthy.

    // NOTE: since paidAmount includes changeAmount, we confirmed after discussion.
    let paidAmountWithoutChange = (newPayment.paidAmount - newPayment.changeAmount);

    if (newPayment.paymentMethod === 'change-wallet') {
      await this._deductFromChangeWalletAsPayment({ customer, amount: paidAmountWithoutChange });
    }

    payment.totalPaidAmount += paidAmountWithoutChange;
    let wasChangeSavedInChangeWallet = false;
    if (newPayment.changeAmount && newPayment.shouldSaveChangeInAccount) {
      wasChangeSavedInChangeWallet = true;
      await this._addChangeToChangeWallet({ customer, amount: newPayment.changeAmount });
    }

    let {
      paymentMethod, paidAmount, changeAmount
    } = newPayment;

    payment.paymentList.push({
      createdDatetimeStamp: Date.now(),
      acceptedByUserId: userId,
      paymentMethod, paidAmount, changeAmount,
      wasChangeSavedInChangeWallet
    });

    return payment;
  }

  async _getCustomer({ customerId }) {
    let customer = await this.database.customer.findById({ id: customerId });
    throwOnFalsy(customer, "CUSTOMER_INVALID", "Customer not found.");
    return customer;
  }

  async _getSales({ salesId }) {
    let sales = await this.database.sales.findById({ id: salesId });
    throwOnFalsy(sales, "SALES_INVALID", "Sales not found");
    return sales;
  }

  async _validateNewPayment({ payment, newPayment, customer }) {
    if (payment.totalBilled > (payment.totalPaidAmount + newPayment.paidAmount)) {
      if (newPayment.changeAmount !== 0) {
        throw new CodedError("INCORRECT_PAYMENT_CALCULATION", "Non-zero change amount.");
      }
    } else {
      let calculatedChangeAmount = (payment.totalPaidAmount + newPayment.paidAmount) - payment.totalBilled;
      if (calculatedChangeAmount !== newPayment.changeAmount) {
        throw new CodedError("INCORRECT_PAYMENT_CALCULATION", "Change calculation not accurate.");
      }
    }
    if (newPayment.paymentMethod === 'change-wallet' && customer.changeWalletBalance < newPayment.paidAmount) {
      throw new CodedError("CUSTOMER_HAS_INSUFFICIENT_BALANCE_IN_CHANGE_WALLET", "The customer does not have enough balance in change wallet.");
    }
  }

  async handle({ userId, body }) {
    let { salesId, customerId, payment: newPayment } = body;
    let sales = this._getSales({ salesId });
    let customer = await this._getCustomer({ customerId });
    let payment = sales.payment;
    await this._validateNewPayment({ payment, newPayment, customer });
    payment = await this._processASinglePayment({ userId, customer, payment, newPayment });
    return { status: "success" };
  }

}