const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.SalesCollection = class extends Collection {

  constructor(...args) {
    super(...args);

    this.collectionName = 'sales';

    this.joiSchema = Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedByUserId: Joi.number().max(999999999999999).allow(null).required(),
      outletId: Joi.number().max(999999999999999).required(),
      customerId: Joi.number().max(999999999999999).allow(null).required(),
      productList: Joi.array().items(
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
        previousCustomerBalance: Joi.number().max(999999999999999).allow(null).required(),
        paidAmount: Joi.number().max(999999999999999).required(),
        changeAmount: Joi.number().max(999999999999999).required()
      }),
      isModified: Joi.boolean().required(),
      isDeleted: Joi.boolean().required(),
      isDiscarded: Joi.boolean().required()
    });

    this.uniqueDefList = [
      {
        additionalQueryFilters: {},
        uniqueKeyList: []
      }
    ];

    this.foreignKeyDefList = [
      {
        targetCollection: 'outlet',
        foreignKey: 'id',
        referringKey: 'outletId'
      },
      // NOTE: commented out because customerId can be null
      // {
      //   targetCollection: 'customer',
      //   foreignKey: 'id',
      //   referringKey: 'customerId'
      // }
    ];
  }

  create({ outletId, customerId, productList, payment }, cbfn) {
    let doc = {
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
    }
    this._insert(doc, (err, id) => {
      return cbfn(err, id);
    });
  }

  findById({ salesId }, cbfn) {
    this._findOne({ id: salesId }, cbfn);
  }

  discard({ salesId }, cbfn) {
    let modifications = {
      $set: { isDiscarded: true }
    }
    this._update({ id: salesId }, modifications, cbfn);
  }

  listByFilters({ outletIdList, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate }, cbfn) {
    let filters = {
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
      filters.$and.push({ outletId });
    }

    if (shouldFilterByCustomer) {
      filters.$and.push({ customerId });
    }

    this._find(filters, cbfn);
  }

  listByFiltersForSalesReturn({ outletIdList, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer }, cbfn) {
    let filters = {
      $and: [
        {
          outletId: { $in: outletIdList }
        }
      ]
    };

    if (shouldFilterByOutlet) {
      filters.$and.push({ outletId });
    }

    if (shouldFilterByCustomer) {
      filters.$and.push({ customerId });
    }

    this._find(filters, cbfn);
  }

}