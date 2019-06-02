
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.ProductCollection = class extends Collection {

  get name() { return 'product'; }

  get joiSchema() {
    return Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      productBlueprintId: Joi.number().max(999999999999999).required(),
      purchasePrice: Joi.number().max(999999999999999).required(),
      salePrice: Joi.number().max(999999999999999).required()
    });
  }

  get uniqueKeyDefList() {
    return [
      {
        filters: {},
        keyList: ['productBlueprintId']
      }
    ];
  }

  get foreignKeyDefList() {
    return [
      {
        targetCollection: 'product-blueprint',
        foreignKey: 'id',
        referringKey: 'productBlueprintId'
      }
    ];
  }

  async create({ productBlueprintId, purchasePrice, salePrice }) {
    return await this._insert({
      productBlueprintId, purchasePrice, salePrice
    });
  }

  async setDetails({ id }, { purchasePrice, salePrice }) {
    return await this._update({ id }, {
      $set: {
        purchasePrice, salePrice
      }
    });
  }

  async findByProductBlueprintId({ productBlueprintId }) {
    return await this._findOne({ productBlueprintId });
  }

}
