
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.ReceiptCollection = class extends Collection {

  get name() { return 'receipt'; }

  get joiSchema() {
    return Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

      salesId: Joi.number().max(999999999999999).required(),
      sentHistory: Joi.array().min(0).items(
        Joi.object().keys({
          sentVia: Joi.string().valid('none', 'print', 'email', 'sms', 'own-sms').required(),
          sentDatetimeStamp: Joi.number().max(999999999999999).required()
        })
      ),
      numberOfTimesViewed: Joi.number().max(999999999999999).required(),
      receiptToken: Joi.string().length(6).required(),

      receiptData: Joi.object().allow(null).required(), // see "_getReceiptData" in sales-mixin.js

      isDeleted: Joi.boolean().required(),
      originApp: Joi.string().valid('torque', 'torque-lite').required(),
    });
  }

  get uniqueKeyDefList() {
    return [];
  }

  // NOTE: Now a sale can have multiple salesId
  // get foreignKeyDefList() {
  //   return [
  //     {
  //       targetCollection: 'sales',
  //       foreignKey: 'id',
  //       referringKey: 'salesId'
  //     }
  //   ];
  // }

  get deletionIndicatorKey() { return 'isDeleted'; }

  async create({ originApp, salesId, sentHistory, receiptToken }) {
    let numberOfTimesViewed = 0;
    return await this._insert({
      originApp,
      salesId, sentHistory, numberOfTimesViewed, receiptToken,
      isDeleted: false,
      receiptData: null
    });
  }

  async findByReceiptToken({ receiptToken }) {
    return await this._findOne({
      receiptToken
    });
  }

  async findBySalesId({ salesId }) {
    return await this._findOne({
      salesId
    });
  }

  async setReceiptData({ id }, { receiptData }) {
    return await this._update({ id }, {
      $set: {
        receiptData
      }
    });
  }

}
