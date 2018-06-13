
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.SesssionCollection = class extends Collection {

  get name() { return 'session'; }

  get joiSchema() {
    return Joi.object().keys({
      userId: Joi.number().max(999999999999999).required(),
      apiKey: Joi.string().length(64).required(),
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      terminatedDatetimeStamp: Joi.number().max(999999999999999).required().allow(null),
      terminatedBy: Joi.string().allow('').max(1024).required(),
      hasExpired: Joi.boolean().required()
    });
  }

  get uniqueKeyDefList() {
    return [
      {
        filters: {},
        keyList: ['apiKey']
      }
    ];
  }

  get foreignKeyDefList() {
    return [
      {
        targetCollection: 'user',
        foreignKey: 'id',
        referringKey: 'userId'
      }
    ];
  }

  async isApiKeyUnique({ apiKey }) {
    let query = { apiKey };
    let doc = await this._findOne(query);
    if (doc) return false;
    return true;
  }

  async create({ userId, apiKey }) {
    return await this._insert({
      userId,
      apiKey,
      createdDatetimeStamp: (new Date()).getTime(),
      terminatedDatetimeStamp: null,
      terminatedBy: '',
      hasExpired: false
    });
  }

  async findByApiKey({ apiKey }) {
    return await this._findOne({ apiKey });
  }

  async close({ id }) {
    return await this._update({ id }, {
      $set: {
        hasExpired: true,
        terminatedBy: 'user',
        terminatedDatetimeStamp: (new Date()).getTime()
      }
    });
  }

  async expire({ id }, cbfn) {
    return await this._update({ id }, {
      $set: {
        hasExpired: true,
        terminatedBy: 'system (expiry)',
        terminatedDatetimeStamp: (new Date()).getTime()
      }
    });
  }

  async expireByUserIdWhenFired({ userId }, cbfn) {
    return await this._updateMany({ userId, hasExpired: false }, {
      $set: {
        hasExpired: true,
        terminatedBy: 'system (fired)',
        terminatedDatetimeStamp: (new Date()).getTime()
      }
    });
  }

}
