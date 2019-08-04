
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.SalesDiscardCollection = class extends Collection {

  get name() { return 'sales-discard'; }

  get joiSchema() {
    return Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

      salesId: Joi.number().max(999999999999999).required(),
      returnedProductList: Joi.array().min(0).items(
        Joi.object().keys({
          productId: Joi.number().max(999999999999999).required(),
          count: Joi.number().max(999999999999999).required()
        })
      ),

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

  // NOTE: commented out, because currently we don't support deleting sales discard.
  // get deletionIndicatorKey() { discard 'isDeleted'; }

  async create({ salesId, returnedProductList }) {
    return await this._insert({
      salesId,
      returnedProductList,

      isDeleted: false
    });
  }

  async listBySalesIdList({ salesIdList }) {
    return await this._find({
      salesId: { $in: salesIdList }
    });
  }

  async findBySalesId({ salesId }) {
    return await this._findOne({
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
