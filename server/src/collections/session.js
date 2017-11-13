
const Joi = require('joi');

let { ensureKeysAreUnique } = require('./../utils/ensure-unique');

exports.sessionMixin = (DatabaseClass) => class extends DatabaseClass {

  get sessionSchema() {
    return Joi.object().keys({
      userId: Joi.number().max(999999999999999).required(),
      apiKey: Joi.string().length(64).required(),
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      closedDatetimeStamp: Joi.number().max(999999999999999).required().allow(null),
      hasExpried: Joi.boolean().required()
    });
  }

  _validateSession(doc, cbfn) {
    let { error: err } = Joi.validate(doc, this.sessionSchema, { convert: false });
    if (err) return cbfn(err);
    let uniqueKeyList = ['apiKey']
    ensureKeysAreUnique(this, 'session', {}, doc, uniqueKeyList, (err) => {
      if (err) return cbfn(err);
      cbfn();
    });
  }

  _insertSession(doc, cbfn) {
    this._validateSession(doc, (err) => {
      if (err) return cbfn(err);
      this.autoGenerateKey('session', (err, sessionId) => {
        if (err) return cbfn(err);
        doc.id = sessionId;
        this.insertOne('session', doc, (err, count) => {
          if (err) return cbfn(err);
          if (count !== 1) return cbfn(new Error("Could not insert session for reasons unknown."));
          return cbfn(null, sessionId);
        });
      });
    });
  }

  _updateSession(query, modifications, cbfn) {
    this.update('session', query, modifications, cbfn);
  }

  ensureApiKeyIsUnique(apiKey, cbfn) {
    let query = { apiKey }
    this.findOne('session', query, (err, doc) => {
      if (err) return cbfn(err);
      if (doc) return cbfn(null, false);
      return cbfn(null, true);
    });
  }

  /**
   * Creates a session if the email is unique
   * @param {any} { email, passwordHash } 
   * @param {any} cbfn 
   */
  createSession({ userId, apiKey }, cbfn) {
    let session = {
      userId,
      apiKey,
      createdDatetimeStamp: (new Date).getTime(),
      closedDatetimeStamp: null,
      hasExpried: false
    }
    this._insertSession(session, (err, id) => {
      return cbfn(err, id);
    })
  }

  getSessionByApiKey(apiKey, cbfn) {
    this.findOne('session', { apiKey }, cbfn);
  }

  closeSession(id, cbfn) {
    let mod = {
      $set: {
        hasExpried: true,
        closedDatetimeStamp: (new Date).getTime()
      }
    }
    this._updateSession({ id }, mod, (err, count) => {
      if (err) return cbfn(err);
      if (count !== 1) return cbfn(new Error("Session Not Found"));
      return cbfn();
    });
  }

  makeSessionAnInvalidSession(id, cbfn) {
    let mod = {
      $set: {
        hasExpried: true
      }
    }
    this._updateSession({ id }, mod, (err, count) => {
      if (err) return cbfn(err);
      if (count !== 1) return cbfn(new Error("Session Not Found"));
      return cbfn();
    });
  }

}
