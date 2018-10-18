
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');

exports.TransferBetweenInventoriesApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      fromInventoryId: Joi.number().max(999999999999999).required(),
      toInventoryId: Joi.number().max(999999999999999).required(),

      productList: Joi.array().min(1).items(
        Joi.object().keys({
          productId: Joi.number().max(999999999999999).required(),
          count: Joi.number().max(999999999999999).required()
        })
      )
    });
  }

  get accessControl() {
    return [
      {
        organizationBy: {
          from: "inventory",
          query: ({ fromInventoryId }) => ({ id: fromInventoryId }),
          select: "organizationId",
          errorCode: "FROM_INVENTORY_INVALID"
        },
        privilegeList: ["PRIV_TRANSFER_ALL_INVENTORIES"]
      },
      {
        organizationBy: {
          from: "inventory",
          query: ({ toInventoryId }) => ({ id: toInventoryId }),
          select: "organizationId",
          errorCode: "TO_INVENTORY_INVALID"
        },
        privilegeList: ["PRIV_TRANSFER_ALL_INVENTORIES"]
      }
    ];
  }

  async _getInventoriesWithId({ fromInventoryId, toInventoryId }) {
    let fromInventory = await this.database.inventory.findById({ id: fromInventoryId });
    throwOnFalsy(fromInventory, "FROM_INVENTORY_INVALID", "Inventory could not be found");
    let toInventory = await this.database.inventory.findById({ id: toInventoryId });
    throwOnFalsy(toInventory, "TO_INVENTORY_INVALID", "Inventory could not be found");
    return { fromInventory, toInventory };
  }

  _transfer({ fromInventory, toInventory, productList }) {
    for (let product of productList) {
      let foundProduct = fromInventory.productList.find(_product => _product.productId === product.productId);
      if (!foundProduct) {
        throw new CodedError("PRODUCT_INVALID", "product could not be found in source inventory");
      }
      if (foundProduct.count < product.count) {
        throw new CodedError("PRODUCT_INSUFFICIENT", "not enough product(s) in source inventory");
      }
      foundProduct.count -= product.count;

      foundProduct = toInventory.productList.find(_product => _product.productId === product.productId);
      if (!foundProduct) {
        toInventory.productList.push(product);
      } else {
        foundProduct.count += product.count;
      }
    }
  }

  async _updateInventories({ fromInventory, toInventory }) {
    let result = await this.database.inventory.setProductList({ id: fromInventory.id }, { productList: fromInventory.productList });
    this.ensureUpdate('inventory', result);
    result = await this.database.inventory.setProductList({ id: toInventory.id }, { productList: toInventory.productList });
    this.ensureUpdate('inventory', result);
  }

  async _addTransferRecord({ createdByUserId, transferredDatetimeStamp, fromInventoryId, toInventoryId, productList }) {
    await this.database.productTransfer.create({ createdByUserId, transferredDatetimeStamp, fromInventoryId, toInventoryId, productList });
  }

  async handle({ body, userId }) {
    let { fromInventoryId, toInventoryId, productList } = body;
    let { fromInventory, toInventory } = await this._getInventoriesWithId({ fromInventoryId, toInventoryId });
    this._transfer({ fromInventory, toInventory, productList });
    await this._updateInventories({ fromInventory, toInventory });
    await this._addTransferRecord({ createdByUserId: userId, transferredDatetimeStamp: (new Date).getTime(), fromInventoryId, toInventoryId, productList })
    return { status: "success" };
  }

}