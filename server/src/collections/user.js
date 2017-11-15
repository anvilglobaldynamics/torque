
const Joi = require('joi');

let { ensureKeysAreUnique } = require('./../utils/ensure-unique');

exports.userMixin = (DatabaseClass) => class extends DatabaseClass {

  get userSchema() {
    return Joi.object().keys({
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
  }

  _validateUser(doc, cbfn) {
    let { error: err } = Joi.validate(doc, this.userSchema, {
      convert: false
    });
    if (err) return cbfn(err);
    let uniqueKeyList = ['email']
    ensureKeysAreUnique(this, 'user', {}, doc, uniqueKeyList, (err) => {
      if (err) return cbfn(err);
      cbfn();
    });
  }

  _insertUser(doc, cbfn) {
    this._validateUser(doc, (err) => {
      if (err) return cbfn(err);
      this.autoGenerateKey('user', (err, userId) => {
        if (err) return cbfn(err);
        doc.id = userId;
        this.insertOne('user', doc, (err, count) => {
          if (err) return cbfn(err);
          if (count !== 1) return cbfn(new Error("Could not insert user for reasons unknown."));
          return cbfn(null, userId);
        });
      });
    });
  }

  _updateUser(query, modifications, cbfn) {
    this.update('user', query, modifications, cbfn);
  }

  /**
   * Creates a user if the email is unique
   * @param {any} { email, passwordHash } 
   * @param {any} cbfn 
   */
  createUser({ email, phone, fullName, passwordHash }, cbfn) {
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
    this._insertUser(user, (err, id) => {
      return cbfn(err, id);
    })
  }

  getUserById(id, cbfn) {
    this.findOne('user', { 'id': id }, cbfn);
  }

  findUserByEmailOrPhoneAndPasswordHash({ emailOrPhone, passwordHash }, cbfn) {
    this.findOne('user', {
      $or: [
        { email: emailOrPhone },
        { phone: emailOrPhone }
      ],
      passwordHash
    }, cbfn);
  }

  makeUserAValidUser(id, cbfn) {
    let mod = {
      $set: {
        isValid: true
      }
    }
    this._updateUser({ id }, mod, (err, count) => {
      if (err) return cbfn(err);
      console.log('count', count);
      if (count !== 1) return cbfn(new Error("User Not Found"));

      return cbfn();
    });
  }

}
