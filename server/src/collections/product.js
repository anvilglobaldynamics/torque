
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.ProductCollection = class extends Collection {

  get name() { return 'product'; }

  get joiSchema() {
    return Joi.object().keys({
      productCategoryId: Joi.number().max(999999999999999).required(),
      purchasePrice: Joi.number().max(999999999999999).required(),
      salePrice: Joi.number().max(999999999999999).required()
    });
  }

  get uniqueKeyDefList() {
    return [];
  }

  get foreignKeyDefList() {
    return [
      {
        targetCollection: 'product-category',
        foreignKey: 'id',
        referringKey: 'productCategoryId'
      }
    ];
  }

  async create({ productCategoryId, purchasePrice, salePrice }) {
    return await this._insert({
      productCategoryId, purchasePrice, salePrice
    });
  }

}
