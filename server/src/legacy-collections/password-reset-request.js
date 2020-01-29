
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

exports.PasswordResetRequestCollection = class extends LegacyCollection {

  constructor(...args) {
    super(...args);

    this.collectionName = 'password-reset-request';

    this.joiSchema = Joi.object().keys({
      forUserId: Joi.number().max(999999999999999).required(),
      forEmail: Joi.string().email().min(3).max(30).allow(null).required(),
      forPhone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).required(),
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      confirmedDatetimeStamp: Joi.number().max(999999999999999).allow(null).required(),
      origin: Joi.string().max(1024).required(),
      confirmationToken: Joi.string().length(6).required(),
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
      },
      {
        targetCollection: 'user',
        foreignKey: 'phone',
        referringKey: 'forPhone'
      }
    ];
  }

  create({ userId, email, phone, origin, confirmationToken }, cbfn) {
    let doc = {
      forEmail: email,
      forPhone: phone,
      forUserId: userId,
      origin,
      confirmationToken,
      confirmedDatetimeStamp: null,
      isPasswordResetComplete: false
    }
    this._insert(doc, (err, id) => {
      return cbfn(err, id);
    })
  }

  // FIXME: better separation between logical and db layer.
  // suggestions: split the process in three steps.
  applyConfirmationToken({ confirmationToken }, cbfn) {
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

  // FIXME: order by createdDatetime so that only the last request
  // can be verified
  findByConfirmationToken({ confirmationToken }, cbfn) {
    let query = { confirmationToken, isPasswordResetComplete: false };
    this._findOne(query, cbfn);
  }

  isConfirmationTokenUnique({ confirmationToken }, cbfn) {
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
