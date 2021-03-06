
const { LegacyCollection } = require('./../legacy-collection-base');

/* =================================================================
+++++++++++++                   WARNING                +++++++++++++
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
++ This is a LegacyCollection. It uses async callbacks. New APIs  ++
++ should not be using this. Even when using with legacy APIs, if ++
++ you make a change, pleaase replicate the change in the         ++
++ non-legacy Collection of the same name.                        ++
++ Talk to @iShafayet if unsure.                                  ++
================================================================= */

const Joi = require('joi');

exports.SessionCollection = class extends LegacyCollection {

  constructor(...args) {
    super(...args);

    this.collectionName = 'session';

    this.joiSchema = Joi.object().keys({
      userId: Joi.number().max(999999999999999).required(),
      apiKey: Joi.string().length(64).required(),
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      terminatedDatetimeStamp: Joi.number().max(999999999999999).required().allow(null),
      terminatedBy: Joi.string().allow('').max(64).required(),
      hasExpired: Joi.boolean().required(),
      originApp: Joi.string().valid('torque', 'torque-lite').required(),
    });

    this.uniqueKeyDefList = [
      {
        filters: {},
        keyList: ['apiKey']
      }
    ];

    this.foreignKeyDefList = [
      {
        targetCollection: 'user',
        foreignKey: 'id',
        referringKey: 'userId'
      }
    ];
  }

  isApiKeyUnique({ apiKey }, cbfn) {
    let query = { apiKey }
    this._findOne(query, (err, doc) => {
      if (err) return cbfn(err);
      if (doc) {
        return cbfn(null, false);
      } else {
        return cbfn(null, true);
      }
    });
  }

  create({ originApp, userId, apiKey }, cbfn) {
    let user = {
      originApp,
      userId,
      apiKey,
      terminatedDatetimeStamp: null,
      terminatedBy: '',
      hasExpired: false
    };
    this._insert(user, (err, id) => {
      return cbfn(err, id);
    });
  }

  findByApiKey({ apiKey }, cbfn) {
    this._findOne({ apiKey }, cbfn);
  }

  // FIXME: Logical Separation
  close({ sessionId }, cbfn) {
    let mod = {
      $set: {
        hasExpired: true,
        terminatedBy: 'user',
        terminatedDatetimeStamp: (new Date).getTime()
      }
    };
    this._update({ id: sessionId }, mod, cbfn);
  }

  // FIXME: Logical Separation
  expire({ sessionId }, cbfn) {
    let mod = {
      $set: {
        hasExpired: true,
        terminatedBy: 'system (expiry)',
        terminatedDatetimeStamp: (new Date).getTime()
      }
    };
    this._update({ id: sessionId }, mod, (err, wasUpdated) => {
      if (err) return cbfn(err);
      if (!wasUpdated) return cbfn(new Error(this.verses.session.sessionNotFound));
      return cbfn();
    });
  }

  expireByUserIdWhenLoggedInFromAnotherDevice({ userId }, cbfn) {
    let mod = {
      $set: {
        hasExpired: true,
        terminatedBy: 'system (duplicate)',
        terminatedDatetimeStamp: (new Date).getTime()
      }
    };
    this._updateMany({ userId, hasExpired: false }, mod, (err, wasUpdated) => {
      if (err) return cbfn(err);
      // NOTE: Willingly not checking if the sessions were actually updated or not.
      // if (!wasUpdated) return cbfn(new Error("Unable to find session to expire"));
      return cbfn();
    });
  }

  expireByUserIdWhenFired({ userId }, cbfn) {
    let mod = {
      $set: {
        hasExpired: true,
        terminatedBy: 'system (fired)',
        terminatedDatetimeStamp: (new Date).getTime()
      }
    };
    this._updateMany({ userId, hasExpired: false }, mod, (err, wasUpdated) => {
      if (err) return cbfn(err);
      // NOTE: Willingly not checking if the sessions were actually updated or not.
      // if (!wasUpdated) return cbfn(new Error("Unable to find session to expire"));
      return cbfn();
    });
  }

}

