const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { InventoryMixin } = require('./mixins/inventory-mixin');
const { CustomerMixin } = require('./mixins/customer-mixin');
const { ProductMixin } = require('./mixins/product-mixin');

exports.AddSalesReturnApi = class extends Api.mixin(InventoryMixin, CustomerMixin, ProductMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({

      salesId: Joi.number().max(999999999999999).required(),

      returnedProductList: Joi.array().items(
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
          select: "organizationId"
        }
      ],
      privileges: [
        "PRIV_ACCESS_POS"
      ]
    }];
  }

  async _returnProducts({ returnedProductList, outletReturnedInventory }) {
    for(let i=0; i<returnedProductList.length; i++) {
      let product = returnedProductList[i];
      await this.database.inventory.addProduct({ id: outletReturnedInventory.id }, { productId: product.productId, count: product.count });
    }
    return;
  }

  async handle({ body }) {
    let { salesId, returnedProductList, creditedAmount, shouldSaveReturnableInChangeWallet } = body;

    let sales = await this.database.sales.findById({ id: salesId });

    await this._verifyProductsExist({ productList: returnedProductList });
    await this._verifyProductsAreReturnable({ productList: returnedProductList });
    
    if (shouldSaveReturnableInChangeWallet && sales.customerId && creditedAmount) {
      let customer = await this.database.customer.findById({ id: sales.customerId });
      await this._addChangeToChangeWallet({ customer, amount: creditedAmount });
    }

    let outletReturnedInventory = await this.__getOutletReturnedInventory({ outletId: sales.outletId });
    await this._returnProducts({ returnedProductList, outletReturnedInventory });
    let salesReturnId = await this.database.salesReturn.create({ salesId, returnedProductList, creditedAmount, shouldSaveReturnableInChangeWallet });
    
    return { status: "success", salesReturnId };
  }

}