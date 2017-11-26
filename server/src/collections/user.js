
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.UserCollection = class extends Collection {

  constructor(...args) {
    super(...args);

    this.collectionName = 'user';

    this.joiSchema = Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      fullName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().alphanum().min(11).max(14).required(),
      passwordHash: Joi.string().min(64).max(64).required(),
      email: Joi.string().email().min(3).max(30).required(),
      nid: Joi.string().min(16).max(16).allow('').required(),
      physicalAddress: Joi.string().min(1).max(128).allow('').required(),
      emergencyContact: Joi.number().min(6).max(11).allow('').required(),
      bloodGroup: Joi.string().alphanum().min(2).max(3).allow('').required(),
      isDeleted: Joi.boolean().required(),
      isPhoneVerified: Joi.boolean().required(),
      isEmailVerified: Joi.boolean().required(),
      isBanned: Joi.boolean().required()
    });

    this.uniqueKeyDefList = [
      {
        filters: {},
        keyList: ['email', 'phone']
      }
    ]
  }

  create({ email, phone, fullName, passwordHash }, cbfn) {
    let user = {
      createdDatetimeStamp: (new Date).getTime(),
      lastModifiedDatetimeStamp: (new Date).getTime(),
      email,
      passwordHash,
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
    }
    this._insert(user, (err, id) => {
      return cbfn(err, id);
    })
  }

  getById(id, cbfn) {
    this._findOne({ id }, cbfn);
  }

  findByEmailOrPhoneAndPasswordHash({ emailOrPhone, passwordHash }, cbfn) {
    this._findOne({
      $or: [
        { email: emailOrPhone },
        { phone: emailOrPhone }
      ],
      passwordHash
    }, cbfn);
  }

  setEmailAsVerified(id, cbfn) {
    let mod = {
      $set: {
        isEmailVerified: true
      }
    }
    this._update({ id }, mod, (err, wasUpdated) => {
      if (err) return cbfn(err);
      if (!wasUpdated) return cbfn(new Error("User Not Found"));
      return cbfn();
    });
  }

  setPhoneAsVerified(id, cbfn) {
    let mod = {
      $set: {
        isValid: true
      }
    }
    this._update({ id }, mod, (err, wasUpdated) => {
      if (err) return cbfn(err);
      if (!wasUpdated) return cbfn(new Error("User Not Found"));
      return cbfn();
    });
  }

  setPasswordHash({ userId, passwordHash }, cbfn) {
    let mod = {
      $set: {
        passwordHash: passwordHash
      }
    }
    this._update({ id: userId }, mod, (err, wasUpdated) => {
      if (err) return cbfn(err);
      if (!wasUpdated) return cbfn(new Error("User Not Found"));
      return cbfn();
    });
  }

}
