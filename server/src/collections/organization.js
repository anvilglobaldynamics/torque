
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.OrganizationCollection = class extends Collection {

  get name() { return 'organization'; }

  get joiSchema() {
    return Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      createdByUserId: Joi.number().max(999999999999999).required(),
      name: Joi.string().min(1).max(64).required(),
      primaryBusinessAddress: Joi.string().min(1).max(128).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required(),
      email: Joi.string().email().min(3).max(30).allow('').required(),
      packageActivationId: Joi.number().max(999999999999999).allow(null).required(),
      isDeleted: Joi.boolean().required()
    });
  }

  get uniqueKeyDefList() {
    return [];
  }

  get foreignKeyDefList() {
    return [];
  }

  async create({ name, primaryBusinessAddress, phone, email, userId }) {
    return await this._insert({
      createdDatetimeStamp: (new Date).getTime(),
      lastModifiedDatetimeStamp: (new Date).getTime(),
      createdByUserId: userId,
      name,
      primaryBusinessAddress,
      phone,
      email,
      packageActivationId: null,
      isDeleted: false
    });
  }

  async update({ id }, { name, primaryBusinessAddress, phone, email }) {
    return await this._update({ id }, {
      $set: {
        name, primaryBusinessAddress, phone, email
      }
    });
  }

  async findByEmailOrPhone({ emailOrPhone }) {
    return await this._findOne({
      $or: [
        { email: emailOrPhone },
        { phone: emailOrPhone }
      ]
    });
  }

  async listByCreatedByUserId({ createdByUserId }) {
    return await this._find({ createdByUserId });
  }

  async setPackageActivationId({ id }, { packageActivationId }) {
    return await this._update({ id }, {
      $set: {
        packageActivationId
      }
    });
  }

}
