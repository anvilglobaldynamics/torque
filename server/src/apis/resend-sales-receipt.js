const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { InventoryMixin } = require('./mixins/inventory-mixin');
const { CustomerMixin } = require('./mixins/customer-mixin');
const { SalesMixin } = require('./mixins/sales-mixin');
const { ServiceMixin } = require('./mixins/service-mixin');

exports.ResendSalesReceiptApi = class extends Api.mixin(InventoryMixin, CustomerMixin, SalesMixin, ServiceMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      salesId: Joi.number().max(999999999999999).required(),
      sentVia: Joi.string().valid('none', 'print', 'email', 'sms', 'own-sms').required(),
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
        "PRIV_ACCESS_POS",
        "PRIV_VIEW_SALES"
      ]
    }];
  }

  async handle({ userId, body }) {
    // NOTE: Add limit after discussion
    // await this.applyGlobalUsageLimit({ useCase: 'resend-sales-receipt' });

    let { salesId, sentVia } = body;
    let organizationId = this.interimData.organization.id;

    let sales = await this.database.sales.findById({ id: salesId });

    throwOnFalsy(sales, "SALES_INVALID", "The sales is invalid");
    throwOnFalsy(sales.customerId, "CUSTOMER_REQUIRED", "A customer is required to send receipt");

    let customer = await this.database.customer.findById({ id: sales.customerId });

    if (sentVia === 'email' && !customer.email) {
      throw new CodedError("CUSTOMER_INVALID", "Customer must have an email address to receive email receipts");
    }

    let receiptToken = await this._createReceipt({ salesId, sentVia });

    let results = {};
    results.receiptToken = receiptToken;
    results.sentVia = sentVia;

    if (sentVia === 'email') {
      await this._sendReceiptByEmail({
        payment: sales.payment,
        organization: this.interimData.organization,
        customer,
        receiptToken
      });
    }

    return results;
  }

}