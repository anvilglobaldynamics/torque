
const Joi = require('joi');

let { ensureKeysAreUnique } = require('./../utils/ensure-unique');

exports.emailVerificationRequestMixin = (DatabaseClass) => class extends DatabaseClass {

  get emailVerificationRequestSchema() {
    return Joi.object().keys({
      forEmail: Joi.string().email().required().min(3).max(30),
      forUserId: Joi.number().required(),
      createdDatetimeStamp: Joi.number().required(),
      verifiedDatetimeStamp: Joi.number().required(),
      origin: Joi.string().required(),
      verificationToken: Joi.string().min(64).max(64).required(),
      isVerificationComplete: Joi.boolean().required(),
    });
  }

  _validateEmailVerificationRequest(doc, cbfn) {
    let { error: err } = Joi.validate(doc, this.emailVerificationRequestSchema, {
      convert: false
    });
    if (err) return cbfn(err);
    let uniqueKeyList = ['verificationToken']
    ensureKeysAreUnique(this, 'email-verification-request', {}, doc, uniqueKeyList, (err) => {
      if (err) return cbfn(err);
      cbfn();
    });
  }

  _insertEmailVerificationRequest(doc, cbfn) {
    this._validateEmailVerificationRequest(doc, (err) => {
      if (err) return cbfn(err);
      this.autoGenerateKey('email-verification-request', (err, id) => {
        if (err) return cbfn(err);
        doc.id = id;
        this.insertOne('email-verification-request', doc, (err, count) => {
          if (err) return cbfn(err);
          if (count !== 1) return cbfn(new Error("Could not insert email-verification-request for reasons unknown."));
          return cbfn(null, id);
        });
      });
    });
  }

  _updateEmailVerificationRequest(query, modifications, cbfn) {
    this.update('email-verification-request', query, modifications, cbfn);
  }

  applyVerificationToken(verificationToken, cbfn) {
    let query = { verificationToken, isVerificationComplete: false };
    this.findOne('email-verification-request', query, (err, doc) => {
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
      this._updateEmailVerificationRequest(query, mod, (err, count) => {
        if (err) return cbfn(err);
        if (count !== 1) return cbfn(new Error("Could not update email-verification-request for reasons unknown."));
        return cbfn(null, doc.forUserId);
      });
    });
  }

  findEmailVerificationRequestByForUserId(userId, cbfn) {
    let query = { forUserId: userId }
    this.findOne('email-verification-request', query, cbfn);
  }

  ensureVerificationTokenIsUnique(verificationToken, cbfn) {
    let query = { verificationToken }
    this.findOne('email-verification-request', query, (err, doc) => {
      if (err) return cbfn(err);
      if (doc) return cbfn(null, false);
      return cbfn(null, true);
    });
  }

  createEmailVerificationRequest({ userId, email, origin, verificationToken }, cbfn) {
    let doc = {
      forEmail: email,
      forUserId: userId,
      origin,
      verificationToken,
      createdDatetimeStamp: (new Date).getTime(),
      verifiedDatetimeStamp: 0,
      isVerificationComplete: false
    }
    this._insertEmailVerificationRequest(doc, (err, id) => {
      return cbfn(err, id);
    })
  }

}
