const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.ProductAcquisitionCollection = class extends Collection {

  get name() { return 'product-acquisition'; }

  get joiSchema() {
    return Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      isDeleted: Joi.boolean().required(),
      createdByUserId: Joi.number().max(999999999999999).required(),

      acquiredDatetimeStamp: Joi.number().max(999999999999999).required(),
      partyType: Joi.string().valid('unspecified', 'own', 'subsidiary', 'vendor').required(),
      partyName: Joi.string().min(1).max(64).allow(null).required(),

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
      }
    ];
  }

  get deletionIndicatorKey() { return 'isDeleted'; }

  async create({ createdByUserId, acquiredDatetimeStamp, partyType, partyName, productList }) {
    return await this._insert({
      createdDatetimeStamp: (new Date).getTime(),
      isDeleted: false,
      createdByUserId,
      acquiredDatetimeStamp,
      partyType,
      partyName,
      productList,
    });
  }

}