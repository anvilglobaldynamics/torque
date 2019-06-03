
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.InventoryCollection = class extends Collection {

  get name() { return 'inventory'; }

  get joiSchema() {
    return Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      inventoryContainerId: Joi.number().max(999999999999999).required(),
      inventoryContainerType: Joi.string().valid('outlet', 'warehouse').required(),
      type: Joi.string().valid('default', 'returned', 'damaged').required(),
      name: Joi.string().min(1).max(64).required(),
      organizationId: Joi.number().max(999999999999999).required(),
      productList: Joi.array().items(
        Joi.object().keys({
          productId: Joi.number().max(999999999999999).required(),
          count: Joi.number().max(999999999999999).required()
        })
      ).required(),
      isDeleted: Joi.boolean().required()
    });
  }

  get uniqueKeyDefList() {
    return [];
  }

  get foreignKeyDefList() {
    return [
      {
        targetCollection: 'organization',
        foreignKey: 'id',
        referringKey: 'organizationId'
      }
    ];
    // NOTES: inventoryContainerId is effectively a foreignKey. Since it may refer
    // to two collections, it's not checked.
  }

  get deletionIndicatorKey() { return 'isDeleted'; }

  async create({ inventoryContainerId, inventoryContainerType, organizationId, type, name }) {
    return await this._insert({
      name,
      organizationId,
      inventoryContainerId,
      inventoryContainerType,
      type,
      productList: [],
      isDeleted: false
    });
  }

  async pushProduct({ id }, { productId, count }) {
    return await this._update({ id }, {
      $push: {
        productList: { productId, count }
      }
    });
  }

  async increaseProductCount({ id, productId }, { count }) {
    return await this._update({ id, 'productList.productId': productId }, {
      $inc: {
        'productList.$.count': count
      }
    });
  }

  async listByInventoryContainerId({ inventoryContainerId, inventoryContainerType }) {
    return await this._find({ inventoryContainerId, inventoryContainerType });
  }

  async listByOrganizationId({ organizationId }) {
    return await this._find({ organizationId });
  }

  async setProductList({ id }, { productList }) {
    return await this._update({ id }, {
      $set: {
        productList
      }
    });
  }

  async deleteAllByInventoryContainerId({ inventoryContainerId, inventoryContainerType }) {
    return await this._deleteMany({ inventoryContainerId, inventoryContainerType });
  }

}
