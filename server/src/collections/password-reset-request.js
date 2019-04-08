
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.PasswordResetRequestCollection = class extends Collection {

  get name() { return 'password-reset-request'; }

  get joiSchema() {
    return Joi.object().keys({
      forUserId: Joi.number().max(999999999999999).required(),
      forEmail: Joi.string().email().min(3).max(30).allow(null).required(),
      forPhone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required(),
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      confirmedDatetimeStamp: Joi.number().max(999999999999999).allow(null).required(),
      origin: Joi.string().max(1024).required(),
      confirmationToken: Joi.string().length(16).required(),
      isPasswordResetComplete: Joi.boolean().required(),
    });
  }

  get uniqueKeyDefList() {
    return [
      {
        filters: {},
        keyList: ['confirmationToken']
      }
    ];
  }

  get foreignKeyDefList() {
    return [
      {
        targetCollection: 'user',
        foreignKey: 'id',
        referringKey: 'forUserId'
      },
      {
        targetCollection: 'user',
        foreignKey: 'phone',
        referringKey: 'forPhone'
      }
    ];
  }

  async isConfirmationTokenUnique({ confirmationToken }) {
    let query = { confirmationToken };
    let doc = await this._findOne(query);
    if (doc) return false;
    return true;
  }

  async create({ userId, email, phone, origin, confirmationToken }) {
    return await this._insert({
      forEmail: email,
      forPhone: phone,
      forUserId: userId,
      origin,
      confirmationToken,
      confirmedDatetimeStamp: null,
      isPasswordResetComplete: false
    });
  }

  async findByConfirmationToken({ confirmationToken }) {
    return await this._findOne({ confirmationToken, isPasswordResetComplete: false });
  }

  // NOTE: Code using this method should check if it returns true or not.
  // If untrue, it should - 
  // let err = new Error('Invalid confirmation token');
  // err.code = "INVALID_CONFIRMATION_TOKEN";
  // throw above error
  // TODO: Remove comment after implementing
  async applyConfirmationToken({ confirmationToken }) {
    return await this._update({ confirmationToken, isPasswordResetComplete: false }, {
      $set: {
        isPasswordResetComplete: true,
        confirmedDatetimeStamp: (new Date()).getTime()
      }
    });
  }

}
