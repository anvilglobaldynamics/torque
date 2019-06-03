
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { ProductBlueprintMixin } = require('./mixins/product-blueprint-mixin');
const { InventoryMixin } = require('./mixins/inventory-mixin');

exports.AddProductToInventoryApi = class extends Api.mixin(ProductBlueprintMixin, InventoryMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      inventoryId: Joi.number().max(999999999999999).required(),
      productList: Joi.array().min(1).items(
        Joi.object().keys({
          productBlueprintId: Joi.number().max(999999999999999).required(),
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

  async _findOrCreateProduct({ productBlueprintId }) {
    let product = await this.database.product.findByProductBlueprintId({ productBlueprintId });
    if (!product) {
      let productBlueprint = await this.database.productBlueprint.findById({ id: productBlueprintId });
      let purchasePrice = productBlueprint.defaultPurchasePrice;
      let salePrice = productBlueprint.defaultSalePrice;
      await this.database.product.create({ productBlueprintId, purchasePrice, salePrice });
      product = await this.database.product.findByProductBlueprintId({ productBlueprintId });
    }
    throwOnFalsy(product, "PRODUCT_NOT_FOUND", "Product could not be found");
    return product;
  }

  async _addProductToInventory({ inventoryId, productList }) {
    let insertedProductList = [];

    await Promise.all(productList.map(async product => {
      let { productBlueprintId, count } = product;

      let { id: productId } = await this._findOrCreateProduct({ productBlueprintId });
      await this._pushProductOrIncrementCount({ productId, count, inventoryId });
      await insertedProductList.push({ productId, count });
    }));
    return insertedProductList;
  }

  async _addAcquisitionRecord({ createdByUserId, acquiredDatetimeStamp, inventoryId, productList }) {
    await this.database.productAcquisition.create({ createdByUserId, acquiredDatetimeStamp, inventoryId, productList: productList });
  }

  async handle({ body, userId }) {
    let { inventoryId, productList } = body;
    await this._verifyProductBlueprintsExist({ productList });
    let insertedProductList = await this._addProductToInventory({ inventoryId, productList });
    await this._addAcquisitionRecord({ createdByUserId: userId, acquiredDatetimeStamp: (new Date).getTime(), inventoryId, productList: insertedProductList });
    return { status: "success", insertedProductList };
  }

}