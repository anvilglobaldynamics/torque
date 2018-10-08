const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { InventoryMixin } = require('./mixins/inventory-mixin');
const { CustomerMixin } = require('./mixins/customer-mixin');
const { SalesMixin } = require('./mixins/sales-mixin');

exports.AddAdditionalPaymentApi = class extends Api.mixin(InventoryMixin, CustomerMixin, SalesMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      salesId: Joi.number().max(999999999999999).required(),
      customerId: Joi.number().max(999999999999999).required(),
      payment: Joi.object().keys({
        paymentMethod: Joi.string().valid('cash', 'card', 'digital', 'change-wallet').required(),
        paidAmount: Joi.number().min(1).max(999999999999999).required(),
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

  async _getCustomer({ customerId }) {
    let customer = await this.database.customer.findById({ id: customerId });
    throwOnFalsy(customer, "CUSTOMER_INVALID", "Customer not found.");
    return customer;
  }

  async _validateNewPayment({ payment, newPayment, customer }) {
    if (newPayment.paymentMethod === 'change-wallet' && customer.changeWalletBalance < newPayment.paidAmount) {
      // throw new CodedError("CUSTOMER_HAS_INSUFFICIENT_BALANCE_IN_CHANGE_WALLET", "The customer does not have enough balance in change wallet.");
      // NOTE: skipping the error throwing here since the error is being thrown by _deductFromChangeWalletAsPayment
    }
    let calculatedChangeAmount = Math.max((payment.totalPaidAmount + newPayment.paidAmount) - payment.totalBilled, 0);
    if (this.round(calculatedChangeAmount) !== this.round(newPayment.changeAmount)) {
      throw new CodedError("INCORRECT_PAYMENT_CALCULATION", "Change calculation is not accurate.");
    }
  }

  async handle({ userId, body }) {
    let { salesId, customerId, payment: newPayment } = body;
    let sales = await this._getSales({ salesId });
    let customer = await this._getCustomer({ customerId });
    let payment = sales.payment;

    await this._validateNewPayment({ payment, newPayment, customer });
    payment = await this._processASinglePayment({ userId, customer, payment, newPayment });
    await this.database.sales.setPayment({ id: salesId }, { payment });
    return { status: "success" };
  }

}