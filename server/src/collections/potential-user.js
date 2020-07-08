
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.PotentialUserCollection = class extends Collection {

  get name() { return 'potential-user'; }

  get joiSchema() {
    return Joi.object().keys({

      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      isDeleted: Joi.boolean().required(),

      source: Joi.string().valid('torque-live-register-page').required(),

      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).allow(null).required(),
      registeredUserId: Joi.number().max(999999999999999).allow(null).required(),
    });
  }

  get uniqueKeyDefList() {
    return [
      {
        filters: {},
        keyList: []
      }
    ];
  }

  get foreignKeyDefList() {
    return [

    ];
  }

  get deletionIndicatorKey() { return 'isDeleted'; }

  async create({ phone, registeredUserId, source }) {
    return await this._insert({
      phone,
      registeredUserId,
      source,
      isDeleted: false
    });
  }

  async setDetails({ phone }, { registeredUserId }) {
    return await this._update({ phone }, {
      $set: {
        registeredUserId
      }
    });
  }

}
