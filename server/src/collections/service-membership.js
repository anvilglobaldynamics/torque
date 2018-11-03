
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.ServiceMembershipCollection = class extends Collection {

  get name() { return 'service-membership'; }

  get joiSchema() {
    return Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      createdByUserId: Joi.number().max(999999999999999).required(),
    
      customerId: Joi.number().max(999999999999999).required(),
      salesId: Joi.number().max(999999999999999).required(),
      serviceId: Joi.number().max(999999999999999).required(),
    
      expiringDatetimeStamp: Joi.number().max(999999999999999).required(),
    
      isDiscarded: Joi.boolean().required(),
      discardReason: Joi.string().allow('').max(128).required(),
      isDeleted: Joi.boolean().required()
    });
  }

  get uniqueKeyDefList() {
    return [];
  }

  get foreignKeyDefList() {
    return [
      {
        targetCollection: 'customer',
        foreignKey: 'id',
        referringKey: 'customerId'
      },
      {
        targetCollection: 'sales',
        foreignKey: 'id',
        referringKey: 'salesId'
      },
      {
        targetCollection: 'service',
        foreignKey: 'id',
        referringKey: 'serviceId'
      }
    ];
  }

  get deletionIndicatorKey() { return 'isDeleted'; }

  async create({ 
    createdByUserId,
    customerId,
    salesId,
    serviceId,
    expiringDatetimeStamp
  }) {
    return await this._insert({
      createdDatetimeStamp: (new Date).getTime(),
      lastModifiedDatetimeStamp: (new Date).getTime(),
      createdByUserId,
    
      customerId,
      salesId,
      serviceId,
    
      expiringDatetimeStamp,
    
      isDiscarded: false,
      discardReason: '',
      isDeleted: false
    });
  }

  async discard({ id }, { discardReason }) {
    return await this._update({ id }, {
      $set: {
        isDiscarded: true, discardReason
      }
    });
  }

  async listBySalesId({ salesId }) {
    return await this._find({ salesId });
  }

}
