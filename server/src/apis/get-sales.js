
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { InventoryMixin } = require('./mixins/inventory-mixin');
const { SalesMixin } = require('./mixins/sales-mixin');
const { ServiceMixin } = require('./mixins/service-mixin');

exports.GetSalesApi = class extends Api.mixin(InventoryMixin, SalesMixin, ServiceMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      salesId: Joi.number().max(999999999999999).required()
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
        "PRIV_VIEW_SALES"
      ]
    }];
  }

  async handle({ body }) {
    let { salesId } = body;

    let sales = await this._getSales({ salesId });

    await this._addReturnedProductCountToSales({ sales });
    await this._addProductBlueprintData({ sales });

    await this._addServiceBlueprintData({ sales });

    await this.__addDiscountPresetName({ sales });

    return {
      sales
    };
  }

}