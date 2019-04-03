
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.DiscountPresetCollection = class extends Collection {

  get name() { return 'discount-preset'; }

  get joiSchema() {
    return Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

      name: Joi.string().min(1).max(64).required(),
      organizationId: Joi.number().max(999999999999999).required(),
      discountType: Joi.string().valid('percent', 'fixed').required(),
      discountValue: Joi.number().max(999999999999999).required(),

      isDeleted: Joi.boolean().required()
    });
  }

  get uniqueKeyDefList() {
    return [];
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

  async create({ name, organizationId, discountType, discountValue }) {
    return await this._insert({
      name, organizationId, discountType, discountValue,
      isDeleted: false
    });
  }

  async setDetails({ id }, { name, discountType, discountValue }) {
    return await this._update({ id }, {
      $set: {
        name, discountType, discountValue
      }
    });
  }

  async listByOrganizationId({ organizationId }) {
    return await this._find({ organizationId });
  }

  async findByIdAndOrganizationId({ id, organizationId }) {
    return await this._findOne({ id, organizationId });
  }

}
