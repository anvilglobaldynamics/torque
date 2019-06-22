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

exports.ProductBlueprintCollection = class extends LegacyCollection {

  constructor(...args) {
    super(...args);

    this.collectionName = 'product-blueprint';

    this.joiSchema = Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      name: Joi.string().min(1).max(64).required(),
      organizationId: Joi.number().max(999999999999999).required(),
      unit: Joi.string().max(64).required(),
      identifierCode: Joi.string().max(64).allow('').required(),
      defaultPurchasePrice: Joi.number().max(999999999999999).required(),
      defaultVat: Joi.number().max(999999999999999).required(),
      defaultSalePrice: Joi.number().max(999999999999999).required(),
      productCategoryIdList: Joi.array().items(Joi.string()).required(),
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
   * @param {any} { organizationId, name, unit, identifierCode, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable } 
   * @param {any} cbfn 
   */
  create(data, cbfn) {
    let {
      organizationId,
      name,
      unit,
      identifierCode,
      defaultPurchasePrice,
      defaultVat,
      defaultSalePrice,
      productCategoryIdList,
      isReturnable
    } = data;
    let doc = {
      organizationId,
      name,
      unit,
      identifierCode,
      defaultPurchasePrice,
      defaultVat,
      defaultSalePrice,
      productCategoryIdList,
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

  findById({ productBlueprintId }, cbfn) {
    this._findOne({ id: productBlueprintId }, cbfn)
  }

  // FIXME: naming issue
  listByIdList({ idList }, cbfn) {
    this._find({ id: { $in: idList } }, cbfn);
  }

  update({ productBlueprintId }, { name, unit, identifierCode, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable }, cbfn) {
    let modifications = {
      $set: {
        name, unit, identifierCode, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable
      }
    }
    this._update({ id: productBlueprintId }, modifications, cbfn);
  }

  delete({ productBlueprintId }, cbfn) {
    let modifications = {
      $set: { isDeleted: true }
    }
    this._update({ id: productBlueprintId }, modifications, cbfn);
  }
}