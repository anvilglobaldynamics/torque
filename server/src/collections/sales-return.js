
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.SalesReturnCollection = class extends Collection {

  get name() { return 'sales-return'; }

  get joiSchema() {
    return Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

      salesId: Joi.number().max(999999999999999).required(),
      returnedProductList: Joi.array().min(1).items(
        Joi.object().keys({
          productId: Joi.number().max(999999999999999).required(),
          count: Joi.number().max(999999999999999).required()
        })
      ),
      creditedAmount: Joi.number().max(999999999999999).required(),
      returnableWasSavedInChangeWallet: Joi.boolean().required(),

      isDeleted: Joi.boolean().required()
    });
  }

  get uniqueKeyDefList() {
    return [];
  }

  get foreignKeyDefList() {
    return [
      {
        targetCollection: 'sales',
        foreignKey: 'id',
        referringKey: 'salesId'
      }
    ];
  }

  // NOTE: commented out, because currently we don't support deleting sales return.
  // get deletionIndicatorKey() { return 'isDeleted'; }

  async create({ salesId, returnedProductList, creditedAmount, shouldSaveReturnableInChangeWallet }) {
    return await this._insert({
      salesId,
      returnedProductList,
      creditedAmount,
      returnableWasSavedInChangeWallet: shouldSaveReturnableInChangeWallet,

      isDeleted: false
    });
  }

  async listBySalesIdList({ salesIdList }) {
    return await this._find({
      salesId: { $in: salesIdList }
    });
  }

  async listBySalesId({ salesId }) {
    return await this._find({
      salesId
    });
  }

  async listByFilters({ salesIdList, fromDate, toDate }) {
    let query = {
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
    };

    return await this._find(query);
  }
  
}
