
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { ProductBlueprintMixin } = require('./mixins/product-blueprint-mixin');

exports.AddProductToInventoryApi = class extends Api.mixin(ProductBlueprintMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      inventoryId: Joi.number().max(999999999999999).required(),
      productList: Joi.array().min(1).items(
        Joi.object().keys({
          productBlueprintId: Joi.number().max(999999999999999).required(),
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
      ],
      moduleList: [
        "MOD_PRODUCT",
      ]
    }];
  }

  async _addProductToInventory({ inventoryId, productList }) {
    let insertedProductList = [];
    await Promise.all(productList.map(async product => {
      let { productBlueprintId, purchasePrice, salePrice, count } = product;
      let productId = await this.database.product.create({ productBlueprintId, purchasePrice, salePrice });
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
    await this._verifyProductBlueprintsExist({ productList });
    let insertedProductList = await this._addProductToInventory({ inventoryId, productList });
    await this._addAcquisitionRecord({ createdByUserId: userId, acquiredDatetimeStamp: (new Date).getTime(), partyType: "unspecified", partyName: null, productList: insertedProductList });
    return { status: "success", insertedProductList };
  }

}