
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.OrganizationCollection = class extends Collection {

  get name() { return 'organization'; }

  get joiSchema() {
    // NOTE: Make sure to check with receipt.js's receiptData property before making any
    // changes to this schema
    return Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      createdByUserId: Joi.number().max(999999999999999).required(),
      name: Joi.string().min(1).max(64).required(),
      primaryBusinessAddress: Joi.string().min(1).max(128).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).allow('').required(),
      countryCode: Joi.string().regex(/^[a-z0-9\+]*$/i).min(2).max(4).required(),
      email: Joi.string().email().min(3).max(30).allow('').required(),
      packageActivationId: Joi.number().max(999999999999999).allow(null).required(),
      isDeleted: Joi.boolean().required(),
      activeModuleCodeList: Joi.array().items(
        Joi.string()
      ).required(),
      originApp: Joi.string().valid('torque', 'torque-lite').required(),
      promoCode: Joi.string().min(0).max(12).allow('').default('').optional()
    });
  }

  get uniqueKeyDefList() {
    return [];
  }

  get foreignKeyDefList() {
    return [];
  }

  async create({ originApp, name, primaryBusinessAddress, phone, email, userId, countryCode = '+880', activeModuleCodeList, promoCode }) {
    return await this._insert({
      originApp,
      createdByUserId: userId,
      name,
      primaryBusinessAddress,
      phone,
      email,
      packageActivationId: null,
      countryCode,
      promoCode,
      isDeleted: false,
      activeModuleCodeList
    });
  }

  async setDetails({ id }, { name, primaryBusinessAddress, phone, email }) {
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

  async setActiveModuleCodeList({ id }, { activeModuleCodeList }) {
    return await this._update({ id }, {
      $set: {
        activeModuleCodeList
      }
    });
  }

}
