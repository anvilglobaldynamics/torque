
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.PasswordResetRequestCollection = class extends Collection {

  constructor(...args) {
    super(...args);

    this.collectionName = 'password-reset-request';

    this.joiSchema = Joi.object().keys({
      forUserId: Joi.number().max(999999999999999).required(),
      forEmail: Joi.string().email().min(3).max(30), 
      forPhone: Joi.string().alphanum().min(11).max(14),
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      confirmedDatetimeStamp: Joi.number().max(999999999999999).required(),
      origin: Joi.string().max(1024).required(),
      confirmationToken: Joi.string().min(64).max(64).required(),
      isPasswordResetComplete: Joi.boolean().required(),
    });

    this.uniqueKeyDefList = [
      {
        filters: {},
        keyList: ['confirmationToken']
      }
    ];

    this.foreignKeyDefList = [
      {
        targetCollection: 'user',
        foreignKey: 'id',
        referringKey: 'forUserId'
      }
    ];
  }

  create({ userId, email, phone, origin, confirmationToken }, cbfn) {
    let user = {
      forEmail: email,
      forPhone: phone,
      forUserId: userId,
      origin,
      confirmationToken,
      createdDatetimeStamp: (new Date).getTime(),
      confirmedDatetimeStamp: 0,
      isPasswordResetComplete: false
    }
    this._insert(user, (err, id) => {
      return cbfn(err, id);
    })
  }

  applyConfirmationToken(confirmationToken, cbfn) {
    let query = { confirmationToken, isPasswordResetComplete: false };
    this._findOne(query, (err, doc) => {
      if (err) return cbfn(err);
      if (!doc) {
        let err = new Error('Invalid confirmation token');
        err.code = "INVALID_CONFIRMATION_TOKEN";
        return cbfn(null, err);
      }
      let mod = {
        $set: {
          isPasswordResetComplete: true,
          confirmedDatetimeStamp: (new Date).getTime()
        }
      };
      this._update(query, mod, (err, wasUpdated) => {
        if (err) return cbfn(err);
        if (!wasUpdated) return cbfn(new Error("Could not update password-reset-request for reasons unknown."));
        return cbfn(null, doc.forUserId);
      });
    });
  }

  findByConfirmationToken(confirmationToken, cbfn) {
    let query = { confirmationToken, isPasswordResetComplete: false }
    this._findOne(query, cbfn);
  }

  ensureConfirmationTokenIsUnique(confirmationToken, cbfn) {
    let query = { confirmationToken }
    this._findOne(query, (err, doc) => {
      if (err) return cbfn(err);
      if (doc) {
        return cbfn(null, false);
      } else {
        return cbfn(null, true);
      }
    });
  }

}
