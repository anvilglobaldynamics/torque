
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.TransactionCollection = class extends Collection {

  get name() { return 'transaction'; }

  get joiSchema() {
    return Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      createdByUserId: Joi.number().max(999999999999999).required(),

      transactionNumber: Joi.number().max(999999999999999).required(),

      transactionDatetimeStamp: Joi.number().max(999999999999999).required(),
      note: Joi.string().allow('').max(64).required(),
      organizationId: Joi.number().max(999999999999999).required(),

      amount: Joi.number().max(999999999999999).required(),
      transactionOrigin: Joi.string().valid('system', 'manual', 'add-income', 'add-expense', 'add-asset-purchase').required(),

      debitList: Joi.array().items(Joi.object().keys({
        accountId: Joi.number().max(999999999999999).required(),
        amount: Joi.number().max(999999999999999).required(),
      })).min(1).required(),

      creditList: Joi.array().items(Joi.object().keys({
        accountId: Joi.number().max(999999999999999).required(),
        amount: Joi.number().max(999999999999999).required(),
      })).min(1).required(),

      party: Joi.object().keys({
        collectionName: Joi.string().min(1).max(32).required(),
        documentId: Joi.number().max(999999999999999).required()
      }).allow(null).required(),

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

  async create({ createdByUserId, organizationId, note, amount, transactionDatetimeStamp, transactionOrigin, debitList, creditList, party, action }) {
    let transactionNumber = await this.autoGenerateOrganizationSpecificNumber({ organizationId, fieldName: 'transactionNumberSeed' });

    return await this._insert({
      createdByUserId, organizationId, note, amount, transactionDatetimeStamp, transactionOrigin, debitList, creditList, party, action,
      transactionNumber,
      isDeleted: false
    });
  }

  async setDetailsForManualEntry({ id }, { transactionDatetimeStamp, note, amount, debitList, creditList }) {
    return await this._update({ id }, {
      $set: {
        transactionDatetimeStamp, note, amount, debitList, creditList
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

  async listByFilters({ organizationId, accountIdList, fromDate, toDate, preset }) {

    let query = { $and: [] };

    query.$and.push({
      organizationId
    });

    if (accountIdList.length > 0) {
      query.$and.push({
        $or: [
          { "debitList.accountId": { $in: accountIdList } },
          { "creditList.accountId": { $in: accountIdList } }
        ]
      });
    }

    if (preset === 'only-manual') {
      query.$and.push({
        transactionOrigin: 'manual'
      });
    }

    query.$and.push({
      transactionDatetimeStamp: {
        $gte: fromDate,
        $lte: toDate
      }
    });

    return await this._find(query);
  }

}
