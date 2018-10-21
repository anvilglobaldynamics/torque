
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.ServiceCollection = class extends Collection {

  get name() { return 'service'; }

  get joiSchema() {
    return Joi.object().keys({

      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      createdByUserId: Joi.number().max(999999999999999).required(),
    
      serviceBlueprintId: Joi.number().max(999999999999999).required(),
      outletId: Joi.number().max(999999999999999).required(),
      
      salePrice: Joi.number().min(0).max(999999999999999).required(),
      isAvailable: Joi.boolean().required()

    });
  }

  get uniqueKeyDefList() {
    return [
      {
        filters: {},
        keyList: ['serviceBlueprintId+outletId']
      }
    ];
  }

  get foreignKeyDefList() {
    return [
      {
        targetCollection: 'user',
        foreignKey: 'id',
        referringKey: 'createdByUserId'
      },
      {
        targetCollection: 'service-blueprint',
        foreignKey: 'id',
        referringKey: 'serviceBlueprintId'
      },
      {
        targetCollection: 'outlet',
        foreignKey: 'id',
        referringKey: 'outletId'
      }
    ];
  }

  async create({ createdByUserId, serviceBlueprintId, outletId, salePrice }) {
    return await this._insert({
      createdDatetimeStamp: (new Date).getTime(),
      lastModifiedDatetimeStamp: (new Date).getTime(),
      createdByUserId,
    
      serviceBlueprintId,
      outletId,
      
      salePrice,
      isAvailable: true
    });
  }

  async setDetails({ id }, { salePrice, isAvailable }) {
    return await this._update({ id }, {
      $set: {
        salePrice, isAvailable
      }
    });
  }

  async setAvailability({ id }, { isAvailable }) {
    return await this._update({ id }, {
      $set: {
        isAvailable
      }
    });
  }

  async listByOutletIdAndSearchString({ outletId, searchString }) {
    let query = { outletId };
    if (searchString) {
      searchString = this.escapeRegExp(searchString);
      let searchRegex = new RegExp(searchString, 'i');
      query.$and = [
        { name: searchRegex },
        { isAvailable: true }
      ];
    }
    return await this._find(query);
  }

  async findByOutletIdAndServiceBlueprintId({ outletId, serviceBlueprintId }) {
    let query = { outletId, serviceBlueprintId };
    return await this._findOne(query);
  }

}
