
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.UserCollection = class extends Collection {

  get name() { return 'user'; }

  get joiSchema() {
    return Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      fullName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required(),
      passwordHash: Joi.string().min(64).max(64).required(),
      email: Joi.string().email().min(3).max(30).allow(null).required(),
      nid: Joi.string().min(16).max(16).allow('').required(),
      physicalAddress: Joi.string().min(1).max(128).allow('').required(),
      emergencyContact: Joi.string().min(1).max(128).allow('').required(),
      bloodGroup: Joi.string().min(2).max(3).allow('').required(),
      isDeleted: Joi.boolean().required(),
      isPhoneVerified: Joi.boolean().required(),
      isEmailVerified: Joi.boolean().required(),
      isBanned: Joi.boolean().required()
    });
  }

  get uniqueKeyDefList() {
    return [
      {
        filters: {},
        keyList: ['phone']
      }
    ];
  }

  async create({ phone, fullName, passwordHash }) {
    return await this._insert({
      createdDatetimeStamp: (new Date).getTime(),
      lastModifiedDatetimeStamp: (new Date).getTime(),
      passwordHash,
      email: null,
      phone,
      fullName,
      nid: '',
      physicalAddress: '',
      emergencyContact: '',
      bloodGroup: '',
      isDeleted: false,
      isPhoneVerified: false,
      isEmailVerified: false,
      isBanned: false
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

  async findByEmailOrPhoneAndPasswordHash({ emailOrPhone, passwordHash }) {
    return await this._findOne({
      $or: [
        { email: emailOrPhone },
        { phone: emailOrPhone }
      ],
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

}
