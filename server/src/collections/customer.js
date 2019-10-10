
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.CustomerCollection = class extends Collection {

  get name() { return 'customer'; }

  get joiSchema() {
    return Joi.object().keys({

      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      isDeleted: Joi.boolean().required(),

      fullName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).allow(null).required(),
      email: Joi.string().email().min(3).max(30).allow(null).required(),
      address: Joi.string().min(1).max(128).allow('').required(),

      organizationId: Joi.number().max(999999999999999).required(),
      changeWalletBalance: Joi.number().max(999999999999999).required(),

      withdrawalHistory: Joi.array().items(
        Joi.object().keys({
          creditedDatetimeStamp: Joi.number().max(999999999999999).required(),
          byUserId: Joi.number().max(999999999999999).required(),
          amount: Joi.number().max(999999999999999).required()
        })
      )

    });
  }

  get uniqueKeyDefList() {
    return [
      {
        filters: {},
        keyList: ['organizationId+phone']
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

  async create({ organizationId, fullName, phone, email, address }) {
    return await this._insert({
      fullName,
      organizationId,
      phone,
      email, 
      address,
      changeWalletBalance: 0,
      withdrawalHistory: [],
      isDeleted: false
    });
  }

  async setProfile({ id }, { fullName, phone, email, address }) {
    return await this._update({ id }, {
      $set: {
        fullName, phone, email, address
      }
    });
  }

  async setWithdrawalHistory({ id }, { withdrawalHistory }) {
    return await this._update({ id }, {
      $set: {
        withdrawalHistory
      }
    });
  }

  async setChangeWalletBalance({ id }, { changeWalletBalance }) {
    return await this._update({ id }, {
      $set: {
        changeWalletBalance
      }
    });
  }

  async listByOrganizationId({ organizationId }) {
    return await this._find({ organizationId });
  }

  async listByOrganizationIdAndSearchString({ organizationId, searchString }) {
    let query = { organizationId };
    if (searchString) {
      searchString = this.escapeRegExp(searchString.toLowerCase());
      let searchRegex = new RegExp(searchString, 'i');
      query.$or = [
        { fullName: searchRegex },
        { phone: searchRegex }
      ];
    }
    return await this._find(query);
  }

}
