
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.SessionCollection = class extends Collection {

  constructor(...args) {
    super(...args);

    this.collectionName = 'session';

    this.joiSchema = Joi.object().keys({
      userId: Joi.number().max(999999999999999).required(),
      apiKey: Joi.string().length(64).required(),
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      terminatedDatetimeStamp: Joi.number().max(999999999999999).required().allow(null),
      terminatedBy: Joi.string().allow('').max(1024).required(),
      hasExpried: Joi.boolean().required()
    });

    this.uniqueKeyDefList = [
      {
        filters: {},
        keyList: ['apiKey']
      }
    ]
  }

  ensureApiKeyIsUnique(apiKey, cbfn) {
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

  create({ userId, apiKey }, cbfn) {
    let user = {
      userId,
      apiKey,
      createdDatetimeStamp: (new Date).getTime(),
      terminatedDatetimeStamp: null,
      terminatedBy: '',
      hasExpried: false
    }
    this._insert(user, (err, id) => {
      return cbfn(err, id);
    })
  }

  getByApiKey(apiKey, cbfn) {
    this._findOne({ apiKey }, cbfn);
  }

  close(id, cbfn) {
    let mod = {
      $set: {
        hasExpried: true,
        terminatedDatetimeStamp: (new Date).getTime()
      }
    }
    this._update({ id }, mod, (err, wasUpdated) => {
      if (err) return cbfn(err);
      if (!wasUpdated) return cbfn(new Error("Session Not Found"));
      return cbfn();
    });
  }

  makeExpired(id, cbfn) {
    let mod = {
      $set: {
        hasExpried: true
      }
    }
    this._update({ id }, mod, (err, wasUpdated) => {
      if (err) return cbfn(err);
      if (!wasUpdated) return cbfn(new Error("Session Not Found"));
      return cbfn();
    });
  }

}

