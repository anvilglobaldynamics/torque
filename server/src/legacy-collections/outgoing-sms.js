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

exports.OutgoingSmsCollection = class extends LegacyCollection {

  constructor(...args) {
    super(...args);

    this.collectionName = 'outgoing-sms';

    this.joiSchema = Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      from: Joi.string().min(1).max(15).required(),
      to: Joi.string().min(1).max(15).required(),
      content: Joi.string().min(1).max(512).required(),
      status: Joi.string().valid('pending', 'sent', 'delivered', 'canceled').required(),
      isDeleted: Joi.boolean().required()
    });

    this.uniqueKeyDefList = [
      {
        filters: {},
        keyList: []
      }
    ];

    this.foreignKeyDefList = [
    ];
  }

  create({ from, to, content }, cbfn) {
    let doc = {
      from, to, content,
      status: 'pending',
      isDeleted: false
    };
    this._insert(doc, (err, id) => {
      return cbfn(err, id);
    });
  }

  updateStatus({ outgoingSmsId }, { status }, cbfn) {
    let modifications = {
      $set: { status }
    };
    this._update({ id: outgoingSmsId }, modifications, cbfn);
  }

  delete({ outgoingSmsId }, cbfn) {
    let modifications = {
      $set: { isDeleted: true }
    };
    this._update({ id: outgoingSmsId }, modifications, cbfn);
  }

  findById({ outgoingSmsId }, cbfn) {
    this._findOne({ id: outgoingSmsId }, cbfn);
  }

  findByDateRange({ fromDate, toDate }, cbfn) {
    this._find({
      createdDatetimeStamp: {
        $gte: fromDate,
        $lte: toDate
      }
    }, cbfn);
  }

}