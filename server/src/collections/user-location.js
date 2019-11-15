
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.UserLocationCollection = class extends Collection {

  get name() { return 'user-location'; }

  get joiSchema() {
    return Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

      userId: Joi.number().max(999999999999999).required(),

      location: Joi.object().keys({
        lat: Joi.number().required(),
        lng: Joi.number().required()
      }).required(),

      action: Joi.string().min(1).max(32).valid('homepage-after-login').required(),

      originApp: Joi.string().valid('torque', 'torque-lite').required(),

    });
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

  async create({ userId, location, action, originApp }) {
    return await this._insert({
      userId, location, action, originApp
    });
  }

}
