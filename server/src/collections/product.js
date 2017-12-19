const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.ProductCollection = class extends Collection {

  constructor(...args) {
    super(...args);

    this.collectionName = 'product';

    this.joiSchema = Joi.object().keys({
      productCategoryId: Joi.number().max(999999999999999).required(),
      purchasePrice: Joi.number().max(999999999999999).required(),
      salePrice: Joi.number().max(999999999999999).required()
    });

    this.uniqueDefList = [
      {
        additionalQueryFilters: {},
        uniqueKeyList: []
      }
    ];

    this.foreignKeyDefList = [
      {
        targetCollection: 'product-category',
        foreignKey: 'id',
        referringKey: 'productCategoryId'
      }
    ];
  }

  create({ productCategoryId, purchasePrice, salePrice }, cbfn) {
    let doc = {
      productCategoryId, purchasePrice, salePrice
    }
    this._insert(doc, (err, id) => {
      return cbfn(err, id);
    });
  }

  findByIdList({ idList }, cbfn) {
    this._find({ id: { $in: idList } }, cbfn);
  }

}