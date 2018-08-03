
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');

exports.AddProductToInventoryApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      inventoryId: Joi.number().max(999999999999999).required(),
      productList: Joi.array().items(
        Joi.object().keys({
          productCategoryId: Joi.number().max(999999999999999).required(),
          purchasePrice: Joi.number().max(999999999999999).required(),
          salePrice: Joi.number().max(999999999999999).required(),
          count: Joi.number().max(999999999999999).required()
        })
      )
    });
  }

  get accessControl() {
    return [{
      organizationBy: {
        from: "inventory",
        query: ({ inventoryId }) => ({ id: inventoryId }),
        select: "organizationId",
        errorCode: "INVENTORY_INVALID"
      },
      privileges: [
        "PRIV_MODIFY_ALL_INVENTORIES"
      ]
    }];
  }

  async _verifyProductCategoriesExist({ productList }) {
    await this.crossmap({
      source: productList,
      sourceKey: 'productCategoryId',
      target: 'productCategory',
      onError: (inventory) => { throw new CodedError("PRODUCT_CATEGORY_INVALID", "Unable to find all products in productList"); }
    });
  }

  async _addProductToInventory({ inventoryId, productList }) {
    await Promise.all(productList.map(async product => {
      let { productCategoryId, purchasePrice, salePrice, count } = product;
      let productId = await this.database.product.create({ productCategoryId, purchasePrice, salePrice });
      this.ensureUpdate('inventory', await this.database.inventory.addProduct({ id: inventoryId }, { productId, count }));
    }));
  }

  async _addAcquisitionRecord({ createdByUserId, acquiredDatetimeStamp, partyType, partyName, productList }) {
    let newProductList = productList.map(product => ({ productCategoryId: product.productCategoryId, count: product.count }));
    await this.database.productAcquisition.create({ createdByUserId, acquiredDatetimeStamp, partyType, partyName, productList: newProductList });
  }

  async handle({ body }) {
    let { inventoryId, productList } = body;
    await this._verifyProductCategoriesExist({ productList });
    await this._addProductToInventory({ inventoryId, productList });
    await this._addAcquisitionRecord({ createdByUserId: 696969, acquiredDatetimeStamp: (new Date).getTime(), partyType: "unspecified", partyName: null, productList });
    return { status: "success" };
  }

}