const { LegacyCollection } = require('../legacy-collection-base');

/* =================================================================
+++++++++++++                   WARNING                +++++++++++++
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
++ This is a LegacyCollection. It uses async callbacks. New APIs  ++
++ should not be using this. Even when using with legacy APIs, if ++
++ you make a change, pleaase replicate the change in the         ++
++ non-legacy Collection of the same name.                        ++
++ Talk to @iShafayet if unsure.                                  ++
================================================================= */

const Joi = require('joi');

exports.ProductCategoryCollection = class extends LegacyCollection {

  constructor(...args) {
    super(...args);

    this.collectionName = 'product-category';

    this.joiSchema = Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      name: Joi.string().min(1).max(64).required(),
      organizationId: Joi.number().max(999999999999999).required(),
      unit: Joi.string().max(64).required(),
      defaultDiscountType: Joi.string().valid('percent', 'fixed').required(),
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
    ];

    this.foreignKeyDefList = [
      {
        targetCollection: 'organization',
        foreignKey: 'id',
        referringKey: 'organizationId'
      }
    ];
  }

  /**
   * 
   * 
   * @param {any} { organizationId, name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable } 
   * @param {any} cbfn 
   */
  create(data, cbfn) {
    let {
      organizationId,
      name,
      unit,
      defaultDiscountType,
      defaultDiscountValue,
      defaultPurchasePrice,
      defaultVat,
      defaultSalePrice,
      isReturnable
    } = data;
    let doc = {
      createdDatetimeStamp: (new Date).getTime(),
      lastModifiedDatetimeStamp: (new Date).getTime(),
      organizationId,
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

  listByOrganizationId({ organizationId }, cbfn) {
    this._find({ organizationId }, cbfn);
  }

  findById({ productCategoryId }, cbfn) {
    this._findOne({ id: productCategoryId }, cbfn)
  }

  // FIXME: naming issue
  listByIdList({ idList }, cbfn) {
    this._find({ id: { $in: idList } }, cbfn);
  }

  update({ productCategoryId }, { name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable }, cbfn) {
    let modifications = {
      $set: {
        name, unit, defaultDiscountType, defaultDiscountValue, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable
      }
    }
    this._update({ id: productCategoryId }, modifications, cbfn);
  }

  delete({ productCategoryId }, cbfn) {
    let modifications = {
      $set: { isDeleted: true }
    }
    this._update({ id: productCategoryId }, modifications, cbfn);
  }
}