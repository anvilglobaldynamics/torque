const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.ProductAcquisitionCollection = class extends Collection {

  get name() { return 'product-acquisition'; }

  get joiSchema() {
    return Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      isDeleted: Joi.boolean().required(),
      createdByUserId: Joi.number().max(999999999999999).required(),

      acquiredDatetimeStamp: Joi.number().max(999999999999999).required(),
      inventoryId: Joi.number().max(999999999999999).required(),
      vendorId: Joi.number().max(999999999999999).allow(null).required(),
      organizationId: Joi.number().max(999999999999999).required(),
      productAcquisitionNumber: Joi.number().max(999999999999999).required(),
    

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
      }
    ];
  }

  get deletionIndicatorKey() { return 'isDeleted'; }

  async create({ createdByUserId, acquiredDatetimeStamp, inventoryId, productList, vendorId, organizationId }) {
    let productAcquisitionNumber = await this.autoGenerateOrganizationSpecificNumber({ organizationId, fieldName: 'productAcquisitionNumberSeed' });

    return await this._insert({
      isDeleted: false,
      createdByUserId,
      acquiredDatetimeStamp,
      inventoryId,
      productList,
      organizationId,
      productAcquisitionNumber,
      vendorId
    });
  }

  async listByProductIdList({ productIdList }) {
    return await this._find({ 'productList': { $elemMatch: { 'productId': { $in: productIdList } } } });
  }

  async listByFilters({ organizationId, fromDate, toDate, vendorId, searchString }) {

    let filterByProductAcquisitionNumber = null;
    if (searchString) {
      if (parseInt(searchString) >= 0) {
        filterByProductAcquisitionNumber = parseInt(searchString);
      }
    }

    let query = { $and: [] };

    // NOTE: If filterByProductAcquisitionNumber is present, other filters must not take any affect.
    if (filterByProductAcquisitionNumber) {

      query.$and.push({
        productAcquisitionNumber: filterByProductAcquisitionNumber,
        organizationId
      });

    } else {

      query.$and.push({
        organizationId
      });

      if (vendorId) {
        query.$and.push({
          vendorId
        });
      }

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