const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { InventoryMixin } = require('./mixins/inventory-mixin');
const { CustomerMixin } = require('./mixins/customer-mixin');
const { SalesMixin } = require('./mixins/sales-mixin');
const { AccountingMixin } = require('./mixins/accounting-mixin');

exports.AddAdditionalPaymentApi = class extends Api.mixin(InventoryMixin, CustomerMixin, SalesMixin, AccountingMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      salesId: Joi.number().max(999999999999999).required(),
      customerId: Joi.number().max(999999999999999).required(),
      payment: Joi.object().keys({
        paymentMethodId: Joi.number().max(999999999999999).required(),
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
          select: "organizationId",
          errorCode: "OUTLET_INVALID"
        }
      ],
      privilegeList: [
        "PRIV_ACCESS_POS"
      ]
    }];
  }

  async _getCustomer({ customerId }) {
    let customer = await this.database.customer.findById({ id: customerId });
    throwOnFalsy(customer, "CUSTOMER_INVALID", "Customer not found.");
    return customer;
  }

  async _validateNewPayment({ payment, paymentListEntry, customer }) {
    if ( paymentListEntry.shouldSaveChangeInAccount) {
      await this.ensureModule('MOD_CUSTOMER_ACCOUNT_BALANCE');
    }

    let calculatedChangeAmount = Math.max((payment.totalPaidAmount + paymentListEntry.paidAmount) - payment.totalBilled, 0);
    if (this.round(calculatedChangeAmount) !== this.round(paymentListEntry.changeAmount)) {
      throw new CodedError("INCORRECT_PAYMENT_CALCULATION", "Change calculation is not accurate.");
    }
  }

  async handle({ userId, body }) {
    let { salesId, customerId, payment: paymentListEntry } = body;
    let { organizationId } = this.interimData;
    let sales = await this._getSales({ salesId });
    let customer = await this._getCustomer({ customerId });
    let payment = sales.payment;

    await this._validateNewPayment({ payment, paymentListEntry, customer });
    payment = await this._processASinglePayment({ userId, customer, payment, paymentListEntry });
    await this.database.sales.setPayment({ id: salesId }, { payment });

    if (await this.hasModule('MOD_ACCOUNTING')) {
      await this.addAddtionalPaymentTransaction({
        transactionData: {
          createdByUserId: userId,
          organizationId
        },
        operationData: { payment: paymentListEntry, salesId, salesNumber: sales.salesNumber, customer }
      });
    }

    return { status: "success" };
  }

}