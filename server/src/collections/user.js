
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.UserCollection = class extends Collection {

  get name() { return 'user'; }

  get joiSchema() {
    // NOTE: Make sure to check with receipt.js's receiptData property before making any
    // changes to this schema
    return Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      fullName: Joi.string().min(1).max(64).required(),

      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).allow(null).required(),
      countryCode: Joi.string().regex(/^[a-z0-9\+]*$/i).min(2).max(4).allow(null).required(),
      email: Joi.string().email().min(3).max(30).required(),

      passwordHash: Joi.string().min(64).max(64).required(),

      nid: Joi.string().min(16).max(16).allow('').required(),
      physicalAddress: Joi.string().min(1).max(128).allow('').required(),
      emergencyContact: Joi.string().min(1).max(128).allow('').required(),
      bloodGroup: Joi.string().min(2).max(3).allow('').required(),
      originType: Joi.string().valid('real', 'test', 'unsure').required(),
      isDeleted: Joi.boolean().required(),
      isPhoneVerified: Joi.boolean().required(),
      isEmailVerified: Joi.boolean().required(),
      isBanned: Joi.boolean().required(),
      accessibleApplicationList: Joi.array().items(
        Joi.string().valid('torque', 'torque-lite').required(),
      ).required(),
      agreedToTocDatetimeStamp: Joi.number().max(999999999999999).allow(null).required(),
      originApp: Joi.string().valid('torque', 'torque-lite').required(),
    });
  }

  get uniqueKeyDefList() {
    return [
      {
        filters: {},
        keyList: ['email']
      }
    ];
  }

  async create({ originApp, email, fullName, passwordHash, agreedToTocDatetimeStamp, accessibleApplicationList }) {
    return await this._insert({
      originApp,
      passwordHash,
      email,
      phone: null,
      countryCode: null,
      fullName,
      nid: '',
      physicalAddress: '',
      emergencyContact: '',
      bloodGroup: '',
      originType: 'unsure',
      isDeleted: false,
      isPhoneVerified: false,
      isEmailVerified: false,
      isBanned: false,
      accessibleApplicationList,
      agreedToTocDatetimeStamp
    });
  }

  async listByCommonFields({ userSearchRegex }) {
    return await this._find({
      $or: [
        { fullName: userSearchRegex },
        { email: userSearchRegex },
        { phone: userSearchRegex },
        { nid: userSearchRegex }
      ]
    });
  }

  async findByEmailOrPhone({ emailOrPhone }) {
    return await this._findOne({
      $or: [
        { email: emailOrPhone },
        { phone: emailOrPhone }
      ]
    });
  }

  async findByEmailOrPhoneAndPasswordHash({ countryCode, emailOrPhone, passwordHash }) {
    return await this._findOne({
      $or: [
        { email: emailOrPhone },
        { phone: emailOrPhone }
      ],
      countryCode,
      passwordHash
    });
  }

  async findByEmailAndPasswordHash({ email, passwordHash }) {
    return await this._findOne({
      email,
      passwordHash
    });
  }

  async setProfile({ id }, { email, phone, fullName, nid, physicalAddress, emergencyContact, bloodGroup }) {
    return await this._update({ id }, {
      $set: {
        email, phone, fullName, nid, physicalAddress, emergencyContact, bloodGroup
      }
    });
  }

  async setEmail({ id }, { email }) {
    return await this._update({ id }, {
      $set: {
        email
      }
    });
  }

  async setEmailVerificationStatus({ id }, { isEmailVerified }) {
    return await this._update({ id }, {
      $set: {
        isEmailVerified
      }
    });
  }

  async setPhoneVerificationStatus({ id }, { isPhoneVerified }) {
    return await this._update({ id }, {
      $set: {
        isPhoneVerified
      }
    });
  }

  async setPasswordHash({ id }, { passwordHash }) {
    return await this._update({ id }, {
      $set: {
        passwordHash: passwordHash
      }
    });
  }

  async setBanningStatus({ id }, { isBanned }) {
    return await this._update({ id }, {
      $set: {
        isBanned
      }
    });
  }

  async setOriginType({ id }, { originType }) {
    return await this._update({ id }, {
      $set: {
        originType
      }
    });
  }

  async setAgreedToTocDatetimeStamp({ id }, { agreedToTocDatetimeStamp }) {
    return await this._update({ id }, {
      $set: {
        agreedToTocDatetimeStamp
      }
    });
  }

}
