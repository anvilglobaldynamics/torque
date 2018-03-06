const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.OutgoingSmsCollection = class extends Collection {

  constructor(...args) {
    super(...args);

    this.collectionName = 'outgoing-sms';

    this.joiSchema = Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      from: Joi.string().min(1).max(15).required(),
      to: Joi.string().min(1).max(15).required(),
      content: Joi.string().min(1).max(512).required(),
      isDelivered: Joi.boolean().required(),
      isCanceled: Joi.boolean().required(),
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
      createdDatetimeStamp: (new Date).getTime(),
      lastModifiedDatetimeStamp: (new Date).getTime(),
      from, to, content,
      isDelivered: false,
      isCanceled: false,
      isDeleted: false
    };
    this._insert(doc, (err, id) => {
      return cbfn(err, id);
    });
  }

  markAsDelivered({ outgoingSmsId }, cbfn) {
    let modifications = {
      $set: { isDelivered: true }
    };
    this._update({ id: outgoingSmsId }, modifications, cbfn);
  }

  cancel({ outgoingSmsId }, cbfn) {
    let modifications = {
      $set: { isCanceled: true }
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