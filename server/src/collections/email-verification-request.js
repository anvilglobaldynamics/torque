
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.EmailVerificationRequestCollection = class extends Collection {

  constructor(...args) {
    super(...args);

    this.collectionName = 'email-verification-request';

    this.joiSchema = Joi.object().keys({
      forEmail: Joi.string().email().required().min(3).max(30),
      forUserId: Joi.number().max(999999999999999).required(),
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      verifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
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
      }
    ];
  }

  create({ userId, email, origin, verificationToken }, cbfn) {
    let user = {
      forEmail: email,
      forUserId: userId,
      origin,
      verificationToken,
      createdDatetimeStamp: (new Date).getTime(),
      verifiedDatetimeStamp: 0,
      isVerificationComplete: false
    }
    this._insert(user, (err, id) => {
      return cbfn(err, id);
    })
  }

  applyVerificationToken(verificationToken, cbfn) {
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
      this._updateEmailVerificationRequest(query, mod, (err, wasUpdated) => {
        if (err) return cbfn(err);
        if (!wasUpdated) return cbfn(new Error("Could not update email-verification-request for reasons unknown."));
        return cbfn(null, doc.forUserId);
      });
    });
  }

  findByForUserId(userId, cbfn) {
    let query = { forUserId: userId }
    this._findOne(query, cbfn);
  }

  ensureVerificationTokenIsUnique(verificationToken, cbfn) {
    let query = { verificationToken }
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
