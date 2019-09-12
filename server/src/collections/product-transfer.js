const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.ProductTransferCollection = class extends Collection {

  get name() { return 'product-transfer'; }

  get joiSchema() {
    return Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      isDeleted: Joi.boolean().required(),
      createdByUserId: Joi.number().max(999999999999999).required(),

      productTransferNumber: Joi.number().max(999999999999999).required(),

      transferredDatetimeStamp: Joi.number().max(999999999999999).required(),
      fromInventoryId: Joi.number().max(999999999999999).required(),
      toInventoryId: Joi.number().max(999999999999999).required(),
      vendorId: Joi.number().max(999999999999999).allow(null).required(),
      organizationId: Joi.number().max(999999999999999).required(),

      isWithinSameInventoryContainer: Joi.boolean().required(),

      productList: Joi.array().min(1).items(
        Joi.object().keys({
          productId: Joi.number().max(999999999999999).required(),
          count: Joi.number().max(999999999999999).required()
        })
      )
    });
  }

  get uniqueKeyDefList() {
    return [];
  }

  get foreignKeyDefList() {
    return [
      {
        targetCollection: 'user',
        foreignKey: 'id',
        referringKey: 'createdByUserId'
      },
      {
        targetCollection: 'inventory',
        foreignKey: 'id',
        referringKey: 'fromInventoryId'
      },
      {
        targetCollection: 'inventory',
        foreignKey: 'id',
        referringKey: 'toInventoryId'
      }
    ];
  }

  get deletionIndicatorKey() { return 'isDeleted'; }

  async create({ organizationId, createdByUserId, transferredDatetimeStamp, fromInventoryId, toInventoryId, productList, vendorId, isWithinSameInventoryContainer }) {
    let productTransferNumber = await this.autoGenerateOrganizationSpecificNumber({ organizationId, fieldName: 'productTransferNumberSeed' });

    return await this._insert({
      isDeleted: false,
      createdByUserId,
      transferredDatetimeStamp,
      fromInventoryId,
      toInventoryId,
      productList,
      organizationId,
      productTransferNumber,
      vendorId,
      isWithinSameInventoryContainer
    });
  }

  async listByProductIdList({ productIdList }) {
    return await this._find({ 'productList': { $elemMatch: { 'productId': { $in: productIdList } } } });
  }


  async listByFilters({ organizationId, fromDate, toDate, searchString }) {

    let filterByProductTransferNumber = null;
    if (searchString) {
      if (parseInt(searchString) >= 0) {
        filterByProductTransferNumber = parseInt(searchString);
      }
    }

    let query = { $and: [] };

    // NOTE: If filterByProductTransferNumber is present, other filters must not take any affect.
    if (filterByProductTransferNumber) {

      query.$and.push({
        productTransferNumber: filterByProductTransferNumber,
        organizationId
      });

    } else {

      query.$and.push({
        organizationId
      });

      query.$and.push({
        createdDatetimeStamp: {
          $gte: fromDate,
          $lte: toDate
        }
      });

    }

    return await this._find(query);
  }

}