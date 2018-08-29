
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.PackageActivationCollection = class extends Collection {

  get name() { return 'package-activation'; }

  get joiSchema() {
    return Joi.object().keys({

      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      packageCode: Joi.alphanum().required(),
      isDiscarded: Joi.boolean().required()

    });
  }

  get uniqueKeyDefList() {
    return [];
  }

  get foreignKeyDefList() {
    return [];
  }

  async create({ packageCode }) {
    return await this._insert({
      createdDatetimeStamp: (new Date).getTime(),
      packageCode,
      isDiscarded: false
    });
  }

  async discard({ id }) {
    return await this._update({ id }, {
      $push: {
        isDiscarded: true
      }
    });
  }

}