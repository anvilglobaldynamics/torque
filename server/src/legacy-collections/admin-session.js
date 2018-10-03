
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

exports.AdminSessionCollection = class extends LegacyCollection {

  constructor(...args) {
    super(...args);

    this.collectionName = 'admin-session';

    this.joiSchema = Joi.object().keys({
      username: Joi.string().max(1024).required(),
      apiKey: Joi.string().length(64).required(),
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      terminatedDatetimeStamp: Joi.number().max(999999999999999).required().allow(null),
      terminatedBy: Joi.string().allow('').max(64).required(),
      hasExpired: Joi.boolean().required()
    });

    this.uniqueKeyDefList = [
      {
        filters: {},
        keyList: ['apiKey']
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

  create({ username, apiKey }, cbfn) {
    let doc = {
      username,
      apiKey,
      createdDatetimeStamp: (new Date).getTime(),
      terminatedDatetimeStamp: null,
      terminatedBy: '',
      hasExpired: false
    };
    this._insert(doc, (err, id) => {
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
      if (!wasUpdated) return cbfn(new Error(this.verses.sessionCommon.sessionNotFound));
      return cbfn();
    });
  }

}

