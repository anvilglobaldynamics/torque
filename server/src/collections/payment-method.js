
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.PaymentMethodCollection = class extends Collection {

  get name() { return 'payment-method'; }

  get joiSchema() {
    return Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

      name: Joi.string().min(1).max(32).required(),
      organizationId: Joi.number().max(999999999999999).required(),
      monetaryAccountId: Joi.number().max(999999999999999).required(),

      isDeleted: Joi.boolean().required()
    });
  }

  get uniqueKeyDefList() {
    return [
      {
        filters: {},
        keyList: ['name+organizationId']
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

  async create({ name, organizationId, monetaryAccountId }) {
    return await this._insert({
      name, organizationId, monetaryAccountId,
      isDeleted: false
    });
  }

  async setDetails({ id }, { name, monetaryAccountId }) {
    return await this._update({ id }, {
      $set: {
        name, monetaryAccountId
      }
    });
  }

  async listByOrganizationId({ organizationId }) {
    return await this._find({ organizationId });
  }

  async findByIdAndOrganizationId({ id, organizationId }) {
    return await this._findOne({ id, organizationId });
  }

  async listByOrganizationIdAndIdList({ organizationId, idList }) {
    let query = { organizationId, id: { $in: idList } };
    return await this._find(query);
  }

}
