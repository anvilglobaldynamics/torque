const { Api } = require('./../api-base');
const Joi = require('joi');
const { ProductMixin } = require('./mixins/product-mixin');
const { InventoryMixin } = require('./mixins/inventory-mixin');

exports.GetProductApi = class extends Api.mixin(ProductMixin, InventoryMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({

      inventoryId: Joi.number().max(999999999999999).required(),
      productId: Joi.number().max(999999999999999).required()

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
        "PRIV_VIEW_ALL_INVENTORIES"
      ]
    }];
  }

  async handle({ body }) {
    let { inventoryId, productId } = body;
    await this.__checkIfInventoryContainsProduct({ inventoryId, productId });
    let product = await this.__getProduct({ productId });
    return { product };
  }

}