
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.OutgoingEmailCollection = class extends Collection {

  get name() { return 'outgoing-email'; }

  get joiSchema() {
    return Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      from: Joi.string().min(5).max(64).required(),
      to: Joi.string().min(5).max(64).required(),
      subject: Joi.string().min(1).max(1024).required(),
      html: Joi.string().min(1).max(65536).required(),
      status: Joi.string().valid('pending', 'sent', 'delivered', 'canceled').required(),
      isDeleted: Joi.boolean().required()
    });
  }

  get uniqueKeyDefList() {
    return [];
  }

  get foreignKeyDefList() {
    return [];
  }

  get deletionIndicatorKey() { return 'isDeleted'; }

  async create({ from, to, subject, html, status = 'pending' }) {
    return await this._insert({
      from, to, 
      subject, html, status,
      isDeleted: false
    });
  }

  async listByDateRange({ fromDate, toDate }) {
    return await this._find({
      createdDatetimeStamp: {
        $gte: fromDate,
        $lte: toDate
      }
    });
  }

  async setStatus({ id }, { status }) {
    return await this._update({ id }, {
      $set: {
        status
      }
    });
  }

}
