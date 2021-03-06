
const { Collection } = require('./../collection-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');

exports.SalesCollection = class extends Collection {

  get name() { return 'sales'; }

  get joiSchema() {
    // NOTE: Make sure to check with receipt.js's receiptData property before making any
    // changes to this schema
    return Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

      outletId: Joi.number().max(999999999999999).required(),
      customerId: Joi.number().max(999999999999999).allow(null).required(),

      salesNumber: Joi.number().max(999999999999999).required(),
      productsSelectedFromWarehouseId: Joi.number().max(999999999999999).allow(null).required(),

      productList: Joi.array().required().items(
        Joi.object().keys({
          productId: Joi.number().max(999999999999999).required(),
          count: Joi.number().max(999999999999999).required(),
          salePrice: Joi.number().max(999999999999999).required(),
          purchasePrice: Joi.number().max(999999999999999).required(),
          salePriceBeforeModification: Joi.number().max(999999999999999).required(),
          vatPercentage: Joi.number().max(999999999999999).required()
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
        discountPresetId: Joi.number().max(999999999999999).allow(null).required(),
        discountType: Joi.string().valid('percent', 'fixed').required(),
        discountValue: Joi.number().max(999999999999999).required(),
        discountedAmount: Joi.number().max(999999999999999).required(),
        serviceChargeAmount: Joi.number().max(999999999999999).required(),
        totalBillBeforeRounding: Joi.number().max(999999999999999).required(),
        roundedByAmount: Joi.number().max(999999999999999).required(),
        totalBilled: Joi.number().max(999999999999999).required(),

        totalPaidAmount: Joi.number().max(999999999999999).required(),
        paymentList: Joi.array().min(1).items(
          Joi.object().keys({
            createdDatetimeStamp: Joi.number().max(999999999999999).required(),
            acceptedByUserId: Joi.number().max(999999999999999).required(),

            paidAmount: Joi.number().max(999999999999999).required(),
            changeAmount: Joi.number().max(999999999999999).required(),

            paymentMethodId: Joi.number().max(999999999999999).required(),

            wasChangeSavedInChangeWallet: Joi.boolean().required()
          })
        )
      }),

      assistedByEmployeeId: Joi.number().min(0).max(999999999999999).allow(null).required(),

      wasOfflineSale: Joi.boolean().required(),
      isModified: Joi.boolean().required(),
      isDeleted: Joi.boolean().required(),
      isDiscarded: Joi.boolean().required(),
      originApp: Joi.string().valid('torque', 'torque-lite').required(),
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

  async create({ originApp, organizationId, outletId, customerId, productList, serviceList, payment, assistedByEmployeeId, wasOfflineSale = false, productsSelectedFromWarehouseId }) {
    let salesNumber = await this.autoGenerateOrganizationSpecificNumber({ organizationId, fieldName: 'salesNumberSeed' });
    return await this._insert({
      originApp,
      outletId,
      customerId,
      productList,
      serviceList,
      assistedByEmployeeId,
      payment,

      salesNumber,

      productsSelectedFromWarehouseId,

      wasOfflineSale,
      isModified: false,
      isDeleted: false,
      isDiscarded: false
    });
  }

  async setPayment({ id }, { payment }) {
    return await this._update({ id }, {
      $set: {
        payment
      }
    });
  }

  async discard({ id }) {
    return await this._update({ id }, {
      $set: {
        isDiscarded: true
      }
    });
  }

  async findBySalesNumber({ salesNumber, outletIdList }) {
    let query = {
      salesNumber,
      outletId: { $in: outletIdList }
    }
    return await this._findOne(query);
  }

  async listByFilters({ outletIdList, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate, searchString }) {

    let filterBySalesNumber = null;
    if (searchString) {
      if (parseInt(searchString) >= 0) {
        filterBySalesNumber = parseInt(searchString);
      }
    }

    let query = { $and: [] };

    // NOTE: If filterBySalesNumber is present, other filters must not take any affect.
    if (filterBySalesNumber) {

      query.$and.push({
        salesNumber: filterBySalesNumber,
        outletId: { $in: outletIdList }
      });

    } else {

      query.$and.push({
        outletId: { $in: outletIdList }
      });

      query.$and.push({
        createdDatetimeStamp: {
          $gte: fromDate,
          $lte: toDate
        }
      });

      if (shouldFilterByOutlet) {
        query.$and.push({ outletId });
      }

      if (shouldFilterByCustomer) {
        query.$and.push({ customerId });
      }

    }

    return await this._find(query);
  }

  async listByFiltersForSalesReturn({ outletIdList, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer }) {
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


  async listByFiltersForCollectionReport({ outletIdList, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate }) {

    let query = { $and: [] };

    query.$and.push({
      outletId: { $in: outletIdList }
    });

    query.$and.push({
      'payment.paymentList.createdDatetimeStamp': {
        $gte: fromDate,
        $lte: toDate
      }
    });

    if (shouldFilterByOutlet) {
      query.$and.push({ outletId });
    }

    if (shouldFilterByCustomer) {
      query.$and.push({ customerId });
    }

    return await this._find(query);
  }

  async listByFiltersForProductSalesReport({ outletIdList, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate }) {

    let query = { $and: [] };

    query.$and.push({
      outletId: { $in: outletIdList }
    });

    query.$and.push({
      'createdDatetimeStamp': {
        $gte: fromDate,
        $lte: toDate
      }
    });

    if (shouldFilterByOutlet) {
      query.$and.push({ outletId });
    }

    if (shouldFilterByCustomer) {
      query.$and.push({ customerId });
    }

    return await this._find(query);
  }


}