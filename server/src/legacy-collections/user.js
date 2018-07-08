
const { LegacyCollection } = require('./../legacy-collection-base');
const Joi = require('joi');

exports.UserCollection = class extends LegacyCollection {

  constructor(...args) {
    super(...args);

    this.collectionName = 'user';

    this.joiSchema = Joi.object().keys({
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

    this.uniqueKeyDefList = [
      {
        filters: {},
        keyList: ['phone']
      }
    ]
  }

  create({ phone, fullName, passwordHash }, cbfn) {
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
    }
    this._insert(user, (err, id) => {
      return cbfn(err, id);
    })
  }

  findById({ userId }, cbfn) {
    this._findOne({ id: userId }, cbfn);
  }

  listByIdList({ idList }, cbfn) {
    let filter = {
      id: { $in: idList }
    }
    this._find(filter, cbfn);
  }

  findByCommonFields({ userSearchRegex }, cbfn) {
    this._find({
      $or: [
        { fullName: userSearchRegex },
        { email: userSearchRegex },
        { phone: userSearchRegex },
        { nid: userSearchRegex }
      ],
    }, cbfn);
  }

  findByEmailOrPhone({ emailOrPhone }, cbfn) {
    this._findOne({
      $or: [
        { email: emailOrPhone },
        { phone: emailOrPhone }
      ],
    }, cbfn);
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

  // FIXME: Logical Separation
  setEmailAsVerified({ userId }, cbfn) {
    let mod = {
      $set: {
        isEmailVerified: true
      }
    }
    this._update({ id: userId }, mod, (err, wasUpdated) => {
      if (err) return cbfn(err);
      if (!wasUpdated) return cbfn(new Error("User Not Found"));
      return cbfn();
    });
  }

  // FIXME: Logical Separation
  setEmailAsUnverified({ userId }, cbfn) {
    let mod = {
      $set: {
        isEmailVerified: false
      }
    }
    this._update({ id: userId }, mod, (err, wasUpdated) => {
      if (err) return cbfn(err);
      if (!wasUpdated) return cbfn(new Error("User Not Found"));
      return cbfn();
    });
  }

  // FIXME: Logical Separation
  setPhoneAsVerified({ userId }, cbfn) {
    let mod = {
      $set: {
        isPhoneVerified: true
      }
    }
    this._update({ id: userId }, mod, (err, wasUpdated) => {
      if (err) return cbfn(err);
      if (!wasUpdated) return cbfn(new Error("User Not Found"));
      return cbfn();
    });
  }

  // FIXME: Logical Separation
  setPhoneAsUnverified({ userId }, cbfn) {
    let mod = {
      $set: {
        isPhoneVerified: false
      }
    }
    this._update({ id: userId }, mod, (err, wasUpdated) => {
      if (err) return cbfn(err);
      if (!wasUpdated) return cbfn(new Error("User Not Found"));
      return cbfn();
    });
  }

  // FIXME: Logical Separation
  setPasswordHash({ userId }, { passwordHash }, cbfn) {
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

  updateBanningStatus({ userId }, {isBanned}, cbfn) {
    let mod = {
      $set: {
        isBanned
      }
    }
    this._update({ id: userId }, mod, cbfn);
  }

  // FIXME: Logical Separation
  /**
   * 
   * @param {any} { userId }
   * @param {any} { email, phone, fullName, nid, physicalAddress, emergencyContact, bloodGroup } 
   * @param {any} cbfn 
   */
  update({ userId }, data, cbfn) {
    let { email, phone, fullName, nid, physicalAddress, emergencyContact, bloodGroup } = data;
    let mod = {
      $set: {
        email, phone, fullName, nid, physicalAddress, emergencyContact, bloodGroup
      }
    }
    this._update({ id: userId }, mod, (err, wasUpdated) => {
      if (err) return cbfn(err);
      if (!wasUpdated) return cbfn(new Error("User Not Found"));
      return cbfn();
    });
  }

  // FIXME: Logical Separation
  /**
   * 
   * @param {any} { userId }
   * @param {any} { email } 
   * @param {any} cbfn 
   */
  setEmail({ userId }, data, cbfn) {
    let { email } = data;
    let mod = {
      $set: {
        email
      }
    }
    this._update({ id: userId }, mod, (err, wasUpdated) => {
      if (err) return cbfn(err);
      if (!wasUpdated) return cbfn(new Error("User Not Found"));
      return cbfn();
    });
  }

}
