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

exports.SalesReturnCollection = class extends LegacyCollection {

  constructor(...args) {
    super(...args);

    this.collectionName = 'sales-return';

    this.joiSchema = Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),

      salesId: Joi.number().max(999999999999999).required(),
      returnedProductList: Joi.array().items(
        Joi.object().keys({
          productId: Joi.number().max(999999999999999).required(),
          count: Joi.number().max(999999999999999).required()
        })
      ),
      creditedAmount: Joi.number().max(999999999999999).required(),
      returnableWasSavedInChangeWallet: Joi.boolean().required(),

      isDeleted: Joi.boolean().required()
    });

    this.uniqueDefList = [
      {
        additionalQueryFilters: {},
        uniqueKeyList: []
      }
    ];

    this.foreignKeyDefList = [
      {
        targetCollection: 'sales',
        foreignKey: 'id',
        referringKey: 'salesId'
      }
    ];
  }

  create({ salesId, returnedProductList, creditedAmount, shouldSaveReturnableInChangeWallet }, cbfn) {
    let doc = {
      createdDatetimeStamp: (new Date).getTime(),

      salesId,
      returnedProductList,
      creditedAmount,
      returnableWasSavedInChangeWallet: shouldSaveReturnableInChangeWallet,

      isDeleted: false
    }
    this._insert(doc, (err, id) => {
      return cbfn(err, id);
    });
  }

  findById({ salesReturnId }, cbfn) {
    this._findOne({ id: salesReturnId }, cbfn);
  }

  listBySalesIdList({ salesIdList }, cbfn) {
    let filter = {
      salesId: { $in: salesIdList }
    }
    this._find(filter, cbfn);
  }

  listBySalesId({ salesId }, cbfn) {
    this._find({ salesId }, cbfn);
  }

  listByFilters({ salesIdList, fromDate, toDate }, cbfn) {
    let filters = {
      $and: [
        {
          salesId: { $in: salesIdList }
        },
        {
          createdDatetimeStamp: {
            $gte: fromDate,
            $lte: toDate
          }
        }
      ]
    }

    this._find(filters, cbfn);
  }

}