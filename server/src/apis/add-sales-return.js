const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { InventoryMixin } = require('./mixins/inventory-mixin');
const { CustomerMixin } = require('./mixins/customer-mixin');
const { ProductMixin } = require('./mixins/product-mixin');
const { AccountingMixin } = require('./mixins/accounting-mixin');

exports.AddSalesReturnApi = class extends Api.mixin(InventoryMixin, CustomerMixin, ProductMixin, AccountingMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({

      salesId: Joi.number().max(999999999999999).required(),

      returnedProductList: Joi.array().min(1).items(
        Joi.object().keys({
          productId: Joi.number().max(999999999999999).required(),
          count: Joi.number().max(999999999999999).required()
        })
      ),

      creditedAmount: Joi.number().max(999999999999999).required(),
      shouldSaveReturnableInChangeWallet: Joi.boolean().required()

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
        "PRIV_MODIFY_SALES_RETURN"
      ],
      moduleList: [
        "MOD_PRODUCT",
      ]
    }];
  }

  async _returnProducts({ returnedProductList, returnedInventory }) {
    for (let i = 0; i < returnedProductList.length; i++) {
      let product = returnedProductList[i];
      await this._pushProductOrIncrementCount({ productId: product.productId, count: product.count, inventoryId: returnedInventory.id });
    }
    return;
  }

  async handle({ body, userId }) {
    let { salesId, returnedProductList, creditedAmount, shouldSaveReturnableInChangeWallet } = body;
    let { organizationId } = this.interimData;

    let sales = await this.database.sales.findById({ id: salesId });
    throwOnTruthy(sales.isDiscarded, "SALES_RETURN_FOR_DISCARDED_SALE_IS_INVALID", "Sales return is not allowed on discarded sales.");

    await this._verifyProductsExist({ productList: returnedProductList });
    await this._verifyProductsAreReturnable({ productList: returnedProductList });

    if (shouldSaveReturnableInChangeWallet && sales.customerId && creditedAmount) {
      let customer = await this.database.customer.findById({ id: sales.customerId });
      await this._addChangeToChangeWallet({ customer, amount: creditedAmount });
    }

    let returnedInventory;
    if (sales.productsSelectedFromWarehouseId) {
      returnedInventory = await this.__getWarehouseReturnedInventory({ warehouseId: sales.productsSelectedFromWarehouseId });
    } else {
      returnedInventory = await this.__getOutletReturnedInventory({ outletId: sales.outletId });
    }

    await this._returnProducts({ returnedProductList, returnedInventory });
    let salesReturnId = await this.database.salesReturn.create({ salesId, returnedProductList, creditedAmount, shouldSaveReturnableInChangeWallet });

    // required for accounting
    returnedProductList.forEach(returnedProduct => {
      let product = sales.productList.find(product => product.productId === returnedProduct.productId);
      returnedProduct.purchasePrice = product.purchasePrice;
    });

    await this.addSalesReturnInventoryTransaction({
      transactionData: {
        createdByUserId: userId,
        organizationId
      },
      operationData: { returnedProductList, salesReturnId, salesNumber: sales.salesNumber }
    });

    await this.addSalesReturnExpenseTransaction({
      transactionData: {
        createdByUserId: userId,
        organizationId
      },
      // since 'creditedAmount' will be confusing
      operationData: { refundedAmount: creditedAmount, salesReturnId, salesNumber: sales.salesNumber }
    });

    return { status: "success", salesReturnId };
  }

}