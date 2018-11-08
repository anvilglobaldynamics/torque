const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { ProductMixin } = require('./mixins/product-mixin');
const { InventoryMixin } = require('./mixins/inventory-mixin');

exports.EditInventoryProductApi = class extends Api.mixin(ProductMixin, InventoryMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({

      inventoryId: Joi.number().max(999999999999999).required(),
      productId: Joi.number().max(999999999999999).required(),
      purchasePrice: Joi.number().max(999999999999999).required(),
      salePrice: Joi.number().max(999999999999999).required()

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
        "PRIV_MODIFY_ALL_PRODUCT_BLUEPRINTS"
      ]
    }];
  }

  async handle({ body }) {
    let { inventoryId, productId, purchasePrice, salePrice } = body;
    await this.__checkIfInventoryContainsProduct({ inventoryId, productId });
    await this._updateProduct({ productId, purchasePrice, salePrice });
    return { status: "success" };
  }

}