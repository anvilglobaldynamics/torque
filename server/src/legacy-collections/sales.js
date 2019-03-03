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

exports.SalesCollection = class extends LegacyCollection {

  constructor(...args) {
    super(...args);

    this.collectionName = 'sales';

    this.joiSchema = Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      
      outletId: Joi.number().max(999999999999999).required(),
      customerId: Joi.number().max(999999999999999).allow(null).required(),

      productList: Joi.array().min(1).items(
        Joi.object().keys({
          productId: Joi.number().max(999999999999999).required(),
          count: Joi.number().max(999999999999999).required(),
          salePrice: Joi.number().max(999999999999999).required(),
          vatPercentage: Joi.number().max(999999999999999).required(),
        })
      ),

      serviceList: Joi.array().required().items(
        Joi.object().keys({
          serviceId: Joi.number().max(999999999999999).required(),
          salePrice: Joi.number().min(0).max(999999999999999).required(),
          vatPercentage: Joi.number().min(0).max(999999999999999).required(),
          assignedEmploymentId: Joi.number().max(999999999999999).allow(null).required()
        })
      ),

      payment: Joi.object().required().keys({
        totalAmount: Joi.number().max(999999999999999).required(),
        vatAmount: Joi.number().max(999999999999999).required(),
        discountType: Joi.string().max(1024).required(),
        discountValue: Joi.number().max(999999999999999).required(),
        discountedAmount: Joi.number().max(999999999999999).required(),
        serviceChargeAmount: Joi.number().max(999999999999999).required(),
        totalBilled: Joi.number().max(999999999999999).required(),
    
        totalPaidAmount: Joi.number().max(999999999999999).required(),
        paymentList: Joi.array().min(1).items(
          Joi.object().keys({
            createdDatetimeStamp: Joi.number().max(999999999999999).required(),
            acceptedByUserId: Joi.number().max(999999999999999).required(),
    
            paidAmount: Joi.number().max(999999999999999).required(),
            changeAmount: Joi.number().max(999999999999999).required(),
            paymentMethod: Joi.string().valid('cash', 'card', 'digital', 'change-wallet').required(),
            wasChangeSavedInChangeWallet: Joi.boolean().required()   
          })
        )
      }),

      wasOfflineSale: Joi.boolean().required(),
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