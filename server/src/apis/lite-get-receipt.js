
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

    if (receipt.receiptData) {
      return receipt.receiptData;
    } else {
      let receiptData = await this._getReceiptData({ receiptId: receipt.id });
      await this.database.receipt.setReceiptData({ id: receipt.id }, { receiptData });
      return receiptData;
    }
  }

}