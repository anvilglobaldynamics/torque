
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.EmailVerificationRequestCollection = class extends Collection {

  get name() { return 'email-verification-request'; }

  get joiSchema() {
    return Joi.object().keys({
      forEmail: Joi.string().email().required().min(3).max(30),
      forUserId: Joi.number().max(999999999999999).required(),
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      verifiedDatetimeStamp: Joi.number().max(999999999999999).allow(null).required(),
      origin: Joi.string().max(1024).required(),
      verificationToken: Joi.string().min(64).max(64).required(),
      isVerificationComplete: Joi.boolean().required(),
    });
  }

  get uniqueKeyDefList() {
    return [
      {
        filters: {},
        keyList: ['verificationToken']
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
        foreignKey: 'email',
        referringKey: 'forEmail'
      }
    ];
  }

  async isVerificationTokenUnique({ verificationToken }) {
    let query = { verificationToken };
    let doc = await this._findOne(query);
    if (doc) return false;
    return true;
  }

  async create({ userId, email, origin, verificationToken }) {
    return await this._insert({
      forEmail: email,
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

  async findByForEmail({ forEmail }) {
    return await this._findOne({ forEmail, isVerificationComplete: false });
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
