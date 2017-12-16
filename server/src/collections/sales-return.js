const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.SalesReturnCollection = class extends Collection {

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

      isDeleted: Joi.boolean().required()
    });

    this.uniqueDefList = [
      {
        additionalQueryFilters: {},
        uniqueKeyList: []
      }
    ]
  }

  create({ salesId, returnedProductList, creditedAmount }, cbfn) {
    let doc = {
      createdDatetimeStamp: (new Date).getTime(),

      salesId,
      returnedProductList,
      creditedAmount,

      isDeleted: false
    }
    this._insert(doc, (err, id) => {
      return cbfn(err, id);
    });
  }

  // findById({ salesId }, cbfn) {
  //   this._findOne({ id: salesId }, cbfn);
  // }

  // listByFilters({ outletIdList, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate }, cbfn) {
  //   let filters = {
  //     $and: [
  //       {
  //         outletId: { $in: outletIdList }
  //       },
  //       {
  //         createdDatetimeStamp: {
  //           $gte: fromDate,
  //           $lte: toDate
  //         }
  //       }
  //     ]
  //   }

  //   if (shouldFilterByOutlet) {
  //     filters.$and.push({ outletId });
  //   }

  //   if (shouldFilterByCustomer) {
  //     filters.$and.push({ customerId });
  //   }

  //   this._find(filters, cbfn);
  // }

}