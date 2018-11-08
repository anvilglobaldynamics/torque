
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.PackageActivationCollection = class extends Collection {

  get name() { return 'package-activation'; }

  get joiSchema() {
    return Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      packageCode: Joi.string().required(),
      organizationId: Joi.number().max(999999999999999).required(),
      createdByAdminName: Joi.string().min(1).max(64).required(),
      paymentReference: Joi.string().min(4).max(128).required(),
      isDiscarded: Joi.boolean().required()
    });
  }

  get uniqueKeyDefList() {
    return [];
  }

  get foreignKeyDefList() {
    return [];
  }

  async create({ packageCode, organizationId, createdByAdminName, paymentReference }) {
    return await this._insert({
      createdDatetimeStamp: (new Date).getTime(),
      packageCode,
      organizationId,
      createdByAdminName,
      paymentReference,
      isDiscarded: false
    });
  }

  async listByOrganizationId({ organizationId }) {
    return await this._find({ organizationId });
  }

  async discard({ id }) {
    return await this._update({ id }, { isDiscarded: true });
  }

}