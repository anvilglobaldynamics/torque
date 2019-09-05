
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.OrganizationSettingsCollection = class extends Collection {

  get name() { return 'organization-settings'; }

  get joiSchema() {
    return Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      organizationId: Joi.number().max(999999999999999).required(),
      receiptText1: Joi.string().min(0).max(128).allow('').required(),
      receiptText2: Joi.string().min(0).max(128).allow('').required(),
      logoImageId: Joi.number().max(999999999999999).allow(null).required(),
      isDeleted: Joi.boolean().required()
    });
  }

  get uniqueKeyDefList() {
    return [
      {
        filters: {},
        keyList: ['organizationId']
      }
    ];
  }

  get foreignKeyDefList() {
    return [
      {
        targetCollection: 'organization',
        foreignKey: 'id',
        referringKey: 'organizationId'
      }
    ];
  }

  get deletionIndicatorKey() { return 'isDeleted'; }

  async create({ organizationId, receiptText1, receiptText2, logoImageId }) {
    return await this._insert({
      organizationId, receiptText1, receiptText2, logoImageId,
      isDeleted: false
    });
  }

  async setDetailsByOrganizationId({ organizationId }, { receiptText1, receiptText2, logoImageId }) {
    return await this._update({ organizationId }, {
      $set: {
        receiptText1, receiptText2, logoImageId
      }
    });
  }

  async findByOrganizationId({ organizationId }) {
    return await this._findOne({ organizationId });
  }

}
