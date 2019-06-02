const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.ProductAcquisitionCollection = class extends Collection {

  get name() { return 'product-acquisition'; }

  get joiSchema() {
    return Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      isDeleted: Joi.boolean().required(),
      createdByUserId: Joi.number().max(999999999999999).required(),

      acquiredDatetimeStamp: Joi.number().max(999999999999999).required(),
      inventoryId: Joi.number().max(999999999999999).required(),

      productList: Joi.array().min(1).items(
        Joi.object().keys({
          productId: Joi.number().max(999999999999999).required(),
          count: Joi.number().max(999999999999999).required()
        })
      )
    });
  }

  get uniqueKeyDefList() {
    return [];
  }

  get foreignKeyDefList() {
    return [
      {
        targetCollection: 'user',
        foreignKey: 'id',
        referringKey: 'createdByUserId'
      }
    ];
  }

  get deletionIndicatorKey() { return 'isDeleted'; }

  async create({ createdByUserId, acquiredDatetimeStamp, inventoryId, productList }) {
    return await this._insert({
      isDeleted: false,
      createdByUserId,
      acquiredDatetimeStamp,
      inventoryId,
      productList,
    });
  }

  async listByProductIdList({ productIdList }) {
    return await this._find({ 'productList': { $elemMatch: { 'productId': { $in: productIdList } } } });
  }

}