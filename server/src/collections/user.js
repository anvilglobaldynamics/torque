
const Joi = require('joi');

let { ensureKeysAreUnique } = require('./../utils/ensure-unique');

exports.userMixin = (DatabaseClass) => class extends DatabaseClass {

  get userSchema() {
    return Joi.object().keys({
      email: Joi.string().email().required().min(3).max(30),
      passwordHash: Joi.string().min(64).max(64).required(),
      isValid: Joi.boolean().required(),
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
  createUser({ email, passwordHash }, cbfn) {
    let user = {
      email,
      passwordHash,
      isValid: false,
      isBanned: false
    }
    this._insertUser(user, (err, id) => {
      return cbfn(err, id);
    })
  }

  getUserById(id, cbfn) {
    this.findOne('user', { 'id': id }, cbfn);
  }

  findUserByEmailAndPasswordHash({ email, passwordHash }, cbfn) {
    this.findOne('user', { email, passwordHash }, cbfn);
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
