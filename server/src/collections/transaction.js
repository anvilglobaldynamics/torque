
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.TransactionCollection = class extends Collection {

  get name() { return 'transaction'; }

  get joiSchema() {
    return Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

      transactionDatetimeStamp: Joi.number().max(999999999999999).required(),
      note: Joi.string().allow('').max(64).required(),
      organizationId: Joi.number().max(999999999999999).required(),

      amount: Joi.number().max(999999999999999).required(),
      transactionType: Joi.string().valid('system', 'manual', 'income', 'expense').required(),
      debitedAccountId: Joi.number().max(999999999999999).required(),
      creditedAccountId: Joi.number().max(999999999999999).required(),
      action: Joi.object().keys({
        name: Joi.string().min(1).max(32).required(),
        collectionName: Joi.string().min(1).max(32).required(),
        documentId: Joi.number().max(999999999999999).required()
      }).allow(null).required(),

      isDeleted: Joi.boolean().required()
    });
  }

  get uniqueKeyDefList() { return []; }

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

  async create({ transactionDatetimeStamp, note, organizationId, amount, transactionType, debitedAccountId, creditedAccountId, action }) {
    return await this._insert({
      transactionDatetimeStamp, note, organizationId, amount, transactionType, debitedAccountId, creditedAccountId, action,
      isDeleted: false
    });
  }

  async setDetailsForManualEntry({ id }, { transactionDatetimeStamp, note, amount, debitedAccountId, creditedAccountId }) {
    return await this._update({ id }, {
      $set: {
        transactionDatetimeStamp, note, amount, debitedAccountId, creditedAccountId
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
