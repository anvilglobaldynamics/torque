const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.ProductCategoryCollection = class extends Collection {

  constructor(...args) {
    super(...args);

    this.collectionName = 'product-category';

    this.joiSchema = Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      name: Joi.string().min(1).max(64).required(),
      organizationId: Joi.number().max(999999999999999).required(),
      parentProductCategoryId: Joi.number().max(999999999999999).allow(null).required(),
      unit: Joi.string().max(1024).required(),
      defaultDiscountType: Joi.string().max(1024).required(),
      defaultDiscountValue: Joi.number().when(
        'defaultDiscountType', {
          is: 'percent',
          then: Joi.number().min(0).max(100).required(),
          otherwise: Joi.number().max(999999999999999).required()
        }
      ),
      defaultPurchasePrice: Joi.number().max(999999999999999).required(),
      defaultVat: Joi.number().max(999999999999999).required(),
      defaultSalePrice: Joi.number().max(999999999999999).required(),
      isDeleted: Joi.boolean().required(),
      isReturnable: Joi.boolean().required()
    });

    this.uniqueDefList = [
      {
        additionalQueryFilters: {},
        uniqueKeyList: []
      }
    ]
  }

  create({ organizationId, parentProductCategoryId, name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable }, cbfn) {
    let doc = {
      createdDatetimeStamp: (new Date).getTime(),
      lastModifiedDatetimeStamp: (new Date).getTime(),
      organizationId,
      parentProductCategoryId,
      name,
      unit,
      defaultDiscountType,
      defaultDiscountValue,
      defaultPurchasePrice,
      defaultVat,
      defaultSalePrice,
      isReturnable,
      isDeleted: false
    }
    this._insert(doc, (err, id) => {
      return cbfn(err, id);
    });
  }

  listByOrganizationId(organizationId, cbfn) {
    this._find({ organizationId }, cbfn);
  }

  getByProductCategoryId(productCategoryId, cbfn) {
    this._findOne({ id: productCategoryId }, cbfn)
  }

  update({ productCategoryId }, { parentProductCategoryId, name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable }, cbfn) {
    let modifications = {
      $set: {
        parentProductCategoryId, name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable
      }
    }
    this._update({ id: productCategoryId }, modifications, cbfn);
  }
}