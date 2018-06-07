
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
      emergencyContact: Joi.string().min(6).max(11).allow('').required(),
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
    let user = {
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
    };
    return await this._insert(user);
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

  async setEmailAsVerified({ id }) {
    let mod = {
      $set: {
        isEmailVerified: true
      }
    };
    return await this._update({ id }, mod);
  }

  async setEmailAsUnverified({ id }) {
    let mod = {
      $set: {
        isEmailVerified: false
      }
    };
    return await this._update({ id }, mod);
  }

  async setPhoneAsVerified({ id }) {
    let mod = {
      $set: {
        isPhoneVerified: true
      }
    };
    return await this._update({ id }, mod);
  }

  async setPhoneAsUnverified({ id }) {
    let mod = {
      $set: {
        isPhoneVerified: false
      }
    };
    return await this._update({ id }, mod);
  }

  async setPasswordHash({ id }, { passwordHash }) {
    let mod = {
      $set: {
        passwordHash: passwordHash
      }
    };
    return await this._update({ id }, mod);
  }

  async updateBanningStatus({ id }, { isBanned }) {
    let mod = {
      $set: {
        isBanned
      }
    };
    return await this._update({ id }, mod);
  }

  async setProfile({ id }, { email, phone, fullName, nid, physicalAddress, emergencyContact, bloodGroup }) {
    let mod = {
      $set: {
        email, phone, fullName, nid, physicalAddress, emergencyContact, bloodGroup
      }
    };
    return await this._update({ id }, mod);
  }

  async setEmail({ id }, { email }) {
    let mod = {
      $set: {
        email
      }
    };
    return await this._update({ id }, mod);
  }

}
