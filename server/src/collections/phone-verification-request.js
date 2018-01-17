
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.PhoneVerificationRequestCollection = class extends Collection {

  constructor(...args) {
    super(...args);

    this.collectionName = 'phone-verification-request';

    this.joiSchema = Joi.object().keys({
      forPhone: Joi.string().alphanum().min(11).max(14).required(),
      forUserId: Joi.number().max(999999999999999).required(),
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      verifiedDatetimeStamp: Joi.number().max(999999999999999).allow(null).required(),
      origin: Joi.string().max(1024).required(),
      verificationToken: Joi.string().min(64).max(64).required(),
      isVerificationComplete: Joi.boolean().required(),
    });

    this.uniqueKeyDefList = [
      {
        filters: {},
        keyList: ['verificationToken']
      }
    ];

    this.foreignKeyDefList = [
      {
        targetCollection: 'user',
        foreignKey: 'id',
        referringKey: 'forUserId'
      },
      {
        targetCollection: 'user',
        foreignKey: 'phone',
        referringKey: 'forPhone'
      }
    ];
  }

  create({ userId, phone, origin, verificationToken }, cbfn) {
    let user = {
      forPhone: phone,
      forUserId: userId,
      origin,
      verificationToken,
      createdDatetimeStamp: (new Date).getTime(),
      verifiedDatetimeStamp: null,
      isVerificationComplete: false
    }
    this._insert(user, (err, id) => {
      return cbfn(err, id);
    })
  }

  // FIXME: better separation between logical and db layer.
  // suggestions: split the process in three steps.
  applyVerificationToken({ verificationToken }, cbfn) {
    let query = { verificationToken, isVerificationComplete: false };
    this._findOne(query, (err, doc) => {
      if (err) return cbfn(err);
      if (!doc) {
        let err = new Error('Invalid verification token');
        err.code = "INVALID_VERIFICATION_TOKEN";
        return cbfn(null, err);
      }
      let mod = {
        $set: {
          isVerificationComplete: true,
          verifiedDatetimeStamp: (new Date).getTime()
        }
      };
      this._update(query, mod, (err, wasUpdated) => {
        if (err) return cbfn(err);
        if (!wasUpdated) return cbfn(new Error("Could not update phone-verification-request for reasons unknown."));
        return cbfn(null, doc.forUserId);
      });
    });
  }

  // FIXME: order by createdDatetime so that only the last request
  // can be verified
  findByForUserId({ userId }, cbfn) {
    let query = { forUserId: userId, isVerificationComplete: false };
    this._findOne(query, cbfn);
  }

  // FIXME: order by createdDatetime so that only the last request
  // can be verified
  findByForPhone({ forPhone }, cbfn) {
    let query = { forPhone: forPhone, isVerificationComplete: false };
    this._findOne(query, cbfn);
  }

  isVerificationTokenUnique({ verificationToken }, cbfn) {
    let query = { verificationToken };
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
