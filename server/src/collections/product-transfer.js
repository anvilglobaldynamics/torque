const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.ProductTransferCollection = class extends Collection {

  get name() { return 'product-transfer'; }

  get joiSchema() {
    return Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      isDeleted: Joi.boolean().required(),
      createdByUserId: Joi.number().max(999999999999999).required(),
    
      transferredDatetimeStamp: Joi.number().max(999999999999999).required(),
      fromInventoryId: Joi.number().max(999999999999999).required(),
      toInventoryId: Joi.number().max(999999999999999).required(),
    
      productList: Joi.array().items(
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
      },
      {
        targetCollection: 'inventory',
        foreignKey: 'id',
        referringKey: 'fromInventoryId'
      },
      {
        targetCollection: 'inventory',
        foreignKey: 'id',
        referringKey: 'toInventoryId'
      }
    ];
  }

  get deletionIndicatorKey() { return 'isDeleted'; }

  async create({ createdByUserId, transferredDatetimeStamp, fromInventoryId, toInventoryId, productList }) {
    return await this._insert({
      createdDatetimeStamp: (new Date).getTime(),
      isDeleted: false,
      createdByUserId,
      transferredDatetimeStamp,
      fromInventoryId,
      toInventoryId,
      productList,
    });
  }

}