
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.AccountCollection = class extends Collection {

  get name() { return 'account'; }

  get joiSchema() {
    return Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

      codeName: Joi.string().min(1).max(32).required(),
      displayName: Joi.string().min(1).max(32).required(),
      nature: Joi.string().valid('asset', 'liability', 'equity', 'revenue', 'expense').required(),
      isMonetaryAccount: Joi.boolean().required(),
      note: Joi.string().allow('').max(64).required(),
      isDefaultAccount: Joi.boolean().required(),
      organizationId: Joi.number().max(999999999999999).required(),

      isDeleted: Joi.boolean().required()
    });
  }

  get uniqueKeyDefList() {
    return [
      {
        filters: {},
        keyList: ['organizationId+codeName']
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

  async create({ codeName, displayName, nature, isMonetaryAccount, note, isDefaultAccount, organizationId }) {
    return await this._insert({
      codeName, displayName, nature, isMonetaryAccount, note, isDefaultAccount, organizationId,
      isDeleted: false
    });
  }

  async setDetails({ id }, { displayName, note }) {
    return await this._update({ id }, {
      $set: {
        displayName, note
      }
    });
  }

  async listByOrganizationId({ organizationId }) {
    return await this._find({ organizationId });
  }

  async findByIdAndOrganizationId({ id, organizationId }) {
    return await this._findOne({ id, organizationId });
  }

  async listByOrganizationIdAndSearchString({ organizationId, searchString }) {
    let query = { organizationId };
    if (searchString) {
      let escapedSearchString = this.escapeRegExp(searchString.toLowerCase());
      let searchRegex = new RegExp(escapedSearchString, 'i');
      query.$or = [
        { displayName: searchRegex }
      ];
    }
    return await this._find(query);
  }

  async listByOrganizationIdAndIdList({ organizationId, idList }) {
    let query = { organizationId, id: { $in: idList } };
    return await this._find(query);
  }

  async listByFilters({ organizationId, filterByNature, filterByIsMonetary, accountIdList }) {

    let query = { $and: [] };

    query.$and.push({
      organizationId
    });

    if (accountIdList.length > 0) {
      query.$and.push({
        id: { $in: accountIdList }
      });
    }

    if (filterByNature !== 'all') {
      query.$and.push({
        nature: filterByNature
      });
    }

    if (filterByIsMonetary !== 'all') {
      let isMonetaryAccount = (filterByIsMonetary === 'only-monetary') ? true : false;
      query.$and.push({
        isMonetaryAccount
      });
    }

    return await this._find(query);
  }

}
