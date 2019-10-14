
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.PhoneVerificationRequestCollection = class extends Collection {

  get name() { return 'phone-verification-request'; }

  get joiSchema() {
    return Joi.object().keys({
      forPhone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required(),
      forUserId: Joi.number().max(999999999999999).allow(null).required(),
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      verifiedDatetimeStamp: Joi.number().max(999999999999999).allow(null).required(),
      origin: Joi.string().max(1024).required(),
      verificationToken: Joi.string().length(5).required(),
      isVerificationComplete: Joi.boolean().required(),
      originApp: Joi.string().valid('torque', 'torque-lite').required(),
    });
  }

  get uniqueKeyDefList() {
    return [
      {
        filters: {},
        keyList: ['forPhone+verificationToken']
      }
    ];
  }

  get foreignKeyDefList() {
    return [
      // // NOTE: Disabled for Lipi Compatibility
      // {
      //   targetCollection: 'user',
      //   foreignKey: 'id',
      //   referringKey: 'forUserId'
      // },
      // {
      //   targetCollection: 'user',
      //   foreignKey: 'phone',
      //   referringKey: 'forPhone'
      // }
    ];
  }

  async isVerificationTokenUnique({ verificationToken }) {
    let query = { verificationToken };
    let doc = await this._findOne(query);
    if (doc) return false;
    return true;
  }

  async create({ originApp, userId, phone, origin, verificationToken }) {
    return await this._insert({
      originApp,
      forPhone: phone,
      forUserId: userId,
      origin,
      verificationToken,
      verifiedDatetimeStamp: null,
      isVerificationComplete: false
    });
  }

  async findByForUserId({ userId }) {
    return await this._findOne({ forUserId: userId, isVerificationComplete: false });
  }

  async findByForPhone({ forPhone }) {
    return await this._findOne({ forPhone: forPhone, isVerificationComplete: false });
  }

  // NOTE: Code using this method should check if it returns true or not.
  // If untrue, it should - 
  // let err = new Error('Invalid verification token');
  // err.code = "INVALID_VERIFICATION_TOKEN";
  // throw above error
  // TODO: Remove comment after implementing
  async applyVerificationToken({ verificationToken }) {
    return await this._update({ verificationToken, isVerificationComplete: false }, {
      $set: {
        isVerificationComplete: true,
        verifiedDatetimeStamp: (new Date()).getTime()
      }
    });
  }

}
