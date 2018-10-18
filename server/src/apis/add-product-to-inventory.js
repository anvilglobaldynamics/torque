
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { ProductCategoryMixin } = require('./mixins/product-category-mixin');

exports.AddProductToInventoryApi = class extends Api.mixin(ProductCategoryMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      inventoryId: Joi.number().max(999999999999999).required(),
      productList: Joi.array().min(1).items(
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
      privilegeList: [
        "PRIV_ADD_PRODUCTS_TO_ALL_INVENTORIES"
      ]
    }];
  }

  async _addProductToInventory({ inventoryId, productList }) {
    let insertedProductList = [];
    await Promise.all(productList.map(async product => {
      let { productCategoryId, purchasePrice, salePrice, count } = product;
      let productId = await this.database.product.create({ productCategoryId, purchasePrice, salePrice });
      insertedProductList.push({ productId, count });
      this.ensureUpdate('inventory', await this.database.inventory.addProduct({ id: inventoryId }, { productId, count }));
    }));
    return insertedProductList;
  }

  async _addAcquisitionRecord({ createdByUserId, acquiredDatetimeStamp, partyType, partyName, productList }) {
    await this.database.productAcquisition.create({ createdByUserId, acquiredDatetimeStamp, partyType, partyName, productList: productList });
  }

  async handle({ body, userId }) {
    let { inventoryId, productList } = body;
    await this._verifyProductCategoriesExist({ productList });
    let insertedProductList = await this._addProductToInventory({ inventoryId, productList });
    await this._addAcquisitionRecord({ createdByUserId: userId, acquiredDatetimeStamp: (new Date).getTime(), partyType: "unspecified", partyName: null, productList: insertedProductList });
    return { status: "success", insertedProductList };
  }

}