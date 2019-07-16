
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

  async _addProductBlueprintData({ sales }) {
    let { productList } = sales;
    await this.__getAggregatedProductListWithoutAcquisitionDetails({ productList });
    productList.forEach(product => {
      let { productBlueprint } = product.product;
      product.productBlueprintId = productBlueprint.id;
      product.productBlueprintName = productBlueprint.name;
      product.productBlueprintUnit = productBlueprint.unit;
      product.productBlueprintIsReturnable = productBlueprint.isReturnable;
      delete product.product;
    });
  }

  async _addServiceBlueprintData({ sales }) {
    let { serviceList } = sales;
    await this.__getAggregatedServiceList({ serviceList });
    serviceList.forEach(service => {
      let { serviceBlueprint } = service.service;
      service.serviceBlueprintId = serviceBlueprint.id;
      service.serviceBlueprintName = serviceBlueprint.name;
      service.serviceBlueprintIsLongstanding = serviceBlueprint.isLongstanding;
      service.serviceBlueprintServiceDuration = serviceBlueprint.serviceDuration;
      service.serviceBlueprintIsRefundable = serviceBlueprint.isRefundable;
      delete service.service;
    });
  }

  async __addDiscountPresetName({ sales }) {
    sales.payment.discountPresetName = '';
    if (sales.payment.discountPresetId === null) return;
    let discountPreset = await this.database.discountPreset.findById({ id: sales.payment.discountPresetId });
    sales.payment.discountPresetName = discountPreset.name;
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