const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { InventoryMixin } = require('./mixins/inventory-mixin');
const { CustomerMixin } = require('./mixins/customer-mixin');
const { SalesMixin } = require('./mixins/sales-mixin');
const { ServiceMixin } = require('./mixins/service-mixin');

exports.AddSalesApi = class extends Api.mixin(InventoryMixin, CustomerMixin, SalesMixin, ServiceMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({

      outletId: Joi.number().max(999999999999999).required(),
      customerId: Joi.number().max(999999999999999).allow(null).required(),

      productsSelectedFromWarehouseId: Joi.number().max(999999999999999).allow(null).required(),

      productList: Joi.array().required().items(
        Joi.object().keys({
          productId: Joi.number().max(999999999999999).required(),
          count: Joi.number().max(999999999999999).required(),
          salePrice: Joi.number().max(999999999999999).required(),
          vatPercentage: Joi.number().max(999999999999999).required(),
        })
      ),

      serviceList: Joi.array().required().items(
        Joi.object().keys({
          serviceId: Joi.number().max(999999999999999).required(),
          salePrice: Joi.number().min(0).max(999999999999999).required(),
          vatPercentage: Joi.number().min(0).max(999999999999999).required(),
          assignedEmploymentId: Joi.number().max(999999999999999).allow(null).required()
        })
      ),

      payment: Joi.object().required().keys({
        totalAmount: Joi.number().max(999999999999999).required(), // means total sale price of all products
        vatAmount: Joi.number().max(999999999999999).required(),
        discountPresetId: Joi.number().max(999999999999999).allow(null).required(),
        discountType: Joi.string().valid('percent', 'fixed').required(),
        discountValue: Joi.number().max(999999999999999).required(),
        discountedAmount: Joi.number().max(999999999999999).required(),
        serviceChargeAmount: Joi.number().max(999999999999999).required(),
        totalBillBeforeRounding: Joi.number().max(999999999999999).required(),
        roundedByAmount: Joi.number().max(999999999999999).required(),
        totalBilled: Joi.number().min(0).max(999999999999999).required(), // this is the final amount customer has to pay (regardless of the method)

        // NOTE: below is a single payment.
        paymentMethod: Joi.string().valid('cash', 'card', 'digital', 'change-wallet').required(),
        paidAmount: Joi.number().max(999999999999999).required(),
        changeAmount: Joi.number().max(999999999999999).required(),
        shouldSaveChangeInAccount: Joi.boolean().required()
      }),

      assistedByEmployeeId: Joi.number().min(0).max(999999999999999).allow(null).required(),

      wasOfflineSale: Joi.boolean().required()

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

  async handle({ userId, body }) {
    let { outletId, customerId, productList, serviceList, assistedByEmployeeId, payment: originalPayment, productsSelectedFromWarehouseId } = body;
    let organizationId = this.interimData.organization.id;

    return await this.__addSales({ userId, organizationId, outletId, customerId, productList, serviceList, assistedByEmployeeId, payment: originalPayment, productsSelectedFromWarehouseId });
  }

}