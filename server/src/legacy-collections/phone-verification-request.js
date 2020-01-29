
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

exports.PhoneVerificationRequestCollection = class extends LegacyCollection {

  constructor(...args) {
    super(...args);

    this.collectionName = 'phone-verification-request';

    this.joiSchema = Joi.object().keys({
      forPhone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).required(),
      forUserId: Joi.number().max(999999999999999).allow(null).required(),
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      verifiedDatetimeStamp: Joi.number().max(999999999999999).allow(null).required(),
      origin: Joi.string().max(1024).required(),
      verificationToken: Joi.string().length(6).required(),
      isVerificationComplete: Joi.boolean().required(),
      originApp: Joi.string().valid('torque', 'torque-lite').required(),
    });

    this.uniqueKeyDefList = [
      {
        filters: {},
        keyList: ['forPhone+verificationToken']
      }
    ];

    this.foreignKeyDefList = [
      // {
      //   targetCollection: 'user',
      //   foreignKey: 'id',
      //   referringKey: 'forUserId'
      // },
      // {
      //   targetCollection: 'user',
      //   foreignKey: 'phone',
      //   referringKey: 'forPhone'
      // }
    ];
  }

  create({ originApp, userId, phone, origin, verificationToken }, cbfn) {
    let user = {
      originApp,
      forPhone: phone,
      forUserId: userId,
      origin,
      verificationToken,
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
