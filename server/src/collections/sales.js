
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.SalesCollection = class extends Collection {

  get name() { return 'sales'; }

  get joiSchema() {
    return Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedByUserId: Joi.number().max(999999999999999).allow(null).required(),
      outletId: Joi.number().max(999999999999999).required(),
      customerId: Joi.number().max(999999999999999).allow(null).required(),
      // FIXME: productList does not need min
      productList: Joi.array().required().min(1).items(
        Joi.object().keys({
          productId: Joi.number().max(999999999999999).required(),
          count: Joi.number().max(999999999999999).required(),
          discountType: Joi.string().max(1024).required(),
          discountValue: Joi.number().max(999999999999999).required(),
          salePrice: Joi.number().max(999999999999999).required()
        })
      ),
      payment: Joi.object().keys({
        totalAmount: Joi.number().max(999999999999999).required(),
        vatAmount: Joi.number().max(999999999999999).required(),
        discountType: Joi.string().max(1024).required(),
        discountValue: Joi.number().max(999999999999999).required(),
        discountedAmount: Joi.number().max(999999999999999).required(),
        serviceChargeAmount: Joi.number().max(999999999999999).required(),
        totalBilled: Joi.number().max(999999999999999).required(),
        paidAmount: Joi.number().max(999999999999999).required(),
        changeAmount: Joi.number().max(999999999999999).required(),
        shouldSaveChangeInAccount: Joi.boolean().required(),
        paymentMethod: Joi.string().valid('cash', 'card', 'digital', 'change-wallet').required()
      }),
      isModified: Joi.boolean().required(),
      isDeleted: Joi.boolean().required(),
      isDiscarded: Joi.boolean().required()
    });
  }

  get uniqueKeyDefList() {
    return [];
  }

  get foreignKeyDefList() {
    return [
      {
        targetCollection: 'outlet',
        foreignKey: 'id',
        referringKey: 'outletId'
      }
    ];
    // NOTE: commented out because customerId can be null
    // {
    //   targetCollection: 'customer',
    //   foreignKey: 'id',
    //   referringKey: 'customerId'
    // }
  }

  // NOTE: commented out, because currently we don't support deleting sales.
  // get deletionIndicatorKey() { return 'isDeleted'; }

  async create({ outletId, customerId, productList, payment }) {
    return await this._insert({
      createdDatetimeStamp: (new Date).getTime(),
      lastModifiedDatetimeStamp: (new Date).getTime(),

      lastModifiedByUserId: null,
      outletId,
      customerId,
      productList,
      payment,

      isModified: false,
      isDeleted: false,
      isDiscarded: false
    });
  }

  async discard({ id }) {
    return await this._update({ id }, {
      $push: {
        isDiscarded: true
      }
    });
  }

  async listByFilters({ outletIdList, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate }) {
    let query = {
      $and: [
        {
          outletId: { $in: outletIdList }
        },
        {
          createdDatetimeStamp: {
            $gte: fromDate,
            $lte: toDate
          }
        }
      ]
    };

    if (shouldFilterByOutlet) {
      query.$and.push({ outletId });
    }

    if (shouldFilterByCustomer) {
      query.$and.push({ customerId });
    }

    return await this._find(query);
  }

  async listByFiltersForSalesReturn({outletIdList, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer }) {
    let query = {
      $and: [
        {
          outletId: { $in: outletIdList }
        }
      ]
    };

    if (shouldFilterByOutlet) {
      query.$and.push({ outletId });
    }

    if (shouldFilterByCustomer) {
      query.$and.push({ customerId });
    }
    
    return await this._find(query);
  }

  async findById({ salesId }) {
    return await this._findOne({ id: salesId });
  }

}