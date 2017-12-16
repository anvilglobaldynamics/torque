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
    ]
  }

  create({ productCategoryId, purchasePrice, salePrice }, cbfn) {
    let doc = {
      productCategoryId, purchasePrice, salePrice
    }
    this._insert(doc, (err, id) => {
      return cbfn(err, id);
    });
  }

  // TODO: make below param obj
  getByIdList(productIdList, cbfn) {
    this._find({ id: { $in: productIdList } }, cbfn);
  }

}