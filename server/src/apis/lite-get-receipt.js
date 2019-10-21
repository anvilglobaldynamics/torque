
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { InventoryMixin } = require('./mixins/inventory-mixin');
const { SalesMixin } = require('./mixins/sales-mixin');
const { ServiceMixin } = require('./mixins/service-mixin');

exports.LiteGetReceiptApi = class extends Api.mixin(InventoryMixin, SalesMixin, ServiceMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return false; }

  get requestSchema() {
    return Joi.object().keys({
      receiptToken: Joi.string().length(6).required(),
    });
  }

  async handle({ body }) {
    let { receiptToken } = body;

    let receipt = await this.database.receipt.findByReceiptToken({ receiptToken });
    throwOnFalsy(receipt, "RECEIPT_INVALID", "The receipt you have asked for is not valid");

    await this.database.receipt._update({ receiptToken }, { $inc: { numberOfTimesViewed: 1 } });

    let sales = await this._getSales({ salesId: receipt.salesId });

    let outlet = await this.database.outlet.findById({ id: sales.outletId });

    let organization = await this.database.organization.findById({ id: outlet.organizationId });

    let customer = null;
    if (sales.customerId !== null) {
      customer = await this.database.customer.findById({ id: sales.customerId });
    }

    let userId = sales.payment.paymentList[0].acceptedByUserId;
    let user = await this.database.user.findById({ id: userId });
    let soldByUser = {
      fullName: user.fullName
    }

    await this._addReturnedProductCountToSales({ sales });
    await this._addProductBlueprintData({ sales });

    await this._addServiceBlueprintData({ sales });

    await this.__addDiscountPresetName({ sales });

    return {
      sales,
      outlet,
      organization,
      soldByUser,
      customer
    };
  }

}