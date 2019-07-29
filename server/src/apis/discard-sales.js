
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { InventoryMixin } = require('./mixins/inventory-mixin');
const { SalesMixin } = require('./mixins/sales-mixin');

exports.DiscardSalesApi = class extends Api.mixin(InventoryMixin, SalesMixin) {

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
        "PRIV_MODIFY_SALES"
      ]
    }];
  }

  async _listAndDiscardServiceMembership({ salesId }) {
    let serviceMembershipList = await this.database.serviceMembership.listBySalesId({ salesId });
    if (serviceMembershipList) {
      for (let i = 0; i < serviceMembershipList.length; i++) {
        await this.database.serviceMembership.discard({ id: serviceMembershipList[i].id }, { discardReason: "Sales Discarded." });
      }
    }
    return;
  }

  _prepareReturnableProductList({ productList }) {
    return productList.map(product => {
      let { productId, count, returnedProductCount } = product;
      count = count - returnedProductCount;
      return { productId, count };
    })
  }

  async _returnProductsToDefaultInventory({ productList, defaultInventory }) {
    for (let i = 0; i < productList.length; i++) {
      let { productId, count } = productList[i];
      await this._pushProductOrIncrementCount({ productId: productId, count: count, inventoryId: defaultInventory.id });
    }
    return;
  }

  async _addSalesDiscard({ productList, sales }) {
    await this.database.salesDiscard.create({
      salesId: sales.id,
      returnedProductList: productList
    });
  }

  async handle({ body }) {
    let { salesId } = body;

    let sales = await this.database.sales.findById({ id: salesId });
    await this._addReturnedProductCountToSales({ sales });

    let defaultInventory;
    if (sales.productsSelectedFromWarehouseId) {
      defaultInventory = await this.__getWarehouseDefaultInventory({ warehouseId: sales.productsSelectedFromWarehouseId });
    } else {
      defaultInventory = await this.__getOutletDefaultInventory({ outletId: sales.outletId });
    }

    let returnableProductList = this._prepareReturnableProductList({ productList: sales.productList });

    await this._returnProductsToDefaultInventory({ productList: returnableProductList, defaultInventory });

    await this._addSalesDiscard({ productList: returnableProductList, sales });

    await this._listAndDiscardServiceMembership({ salesId });

    await this.database.sales.discard({ id: salesId });

    return { status: 'success' };
  }

}