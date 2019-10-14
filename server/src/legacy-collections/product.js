const { LegacyCollection } = require('./../legacy-collection-base');

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

exports.ProductCollection = class extends LegacyCollection {

  constructor(...args) {
    super(...args);

    this.collectionName = 'product';

    this.joiSchema = Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      productBlueprintId: Joi.number().max(999999999999999).required(),
      purchasePrice: Joi.number().max(999999999999999).required(),
      salePrice: Joi.number().max(999999999999999).required(),
      originApp: Joi.string().valid('torque', 'torque-lite').required(),
    });

    this.uniqueKeyDefList = [
      {
        filters: {},
        keyList: ['productBlueprintId']
      }
    ];

    this.foreignKeyDefList = [
      {
        targetCollection: 'product-blueprint',
        foreignKey: 'id',
        referringKey: 'productBlueprintId'
      }
    ];
  }

  create({ originApp, productBlueprintId, purchasePrice, salePrice }, cbfn) {
    let doc = {
      originApp,
      productBlueprintId, purchasePrice, salePrice
    }
    this._insert(doc, (err, id) => {
      return cbfn(err, id);
    });
  }

  findByIdList({ idList }, cbfn) {
    this._find({ id: { $in: idList } }, cbfn);
  }

  findById({ productId }, cbfn) {
    this._findOne({ id: productId }, cbfn);
  }

}