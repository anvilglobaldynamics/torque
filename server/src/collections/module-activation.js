
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.ModuleActivationCollection = class extends Collection {

  get name() { return 'module-activation'; }

  get joiSchema() {
    return Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      deactivatedDatetimeStamp: Joi.number().max(999999999999999).allow(null).required(),
      moduleCode: Joi.string().required(),
      organizationId: Joi.number().max(999999999999999).required(),
      createdByAdminName: Joi.string().min(1).max(64).required(),
      paymentReference: Joi.string().min(4).max(128).required(),
      isDeactivated: Joi.boolean().required()
    });
  }

  get uniqueKeyDefList() {
    return [];
  }

  get foreignKeyDefList() {
    return [];
  }

  async create({ moduleCode, organizationId, createdByAdminName, paymentReference }) {
    return await this._insert({
      createdDatetimeStamp: Date.now(),
      deactivatedDatetimeStamp: null,
      moduleCode,
      organizationId,
      createdByAdminName,
      paymentReference,
      isDeactivated: false
    });
  }

  async listByOrganizationId({ organizationId }) {
    return await this._find({ organizationId });
  }

  async findByOrganizationIdAndModuleCode({ organizationId, moduleCode }) {
    return await this._findOne({ organizationId, moduleCode });
  }

  async deactivate({ id }) {
    return await this._update({ id }, { $set: { isDeactivated: true, deactivatedDatetimeStamp: Date.now() } });
  }

}