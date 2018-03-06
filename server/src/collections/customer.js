
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.CustomerCollection = class extends Collection {

  constructor(...args) {
    super(...args);

    this.collectionName = 'customer';

    this.joiSchema = Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      fullName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().alphanum().min(11).max(14).required(),
      organizationId: Joi.number().max(999999999999999).required(),
      balance: Joi.number().max(999999999999999).required(),
      isDeleted: Joi.boolean().required(),

      additionalPaymentHistory: Joi.array().items(
        Joi.object().keys({
          creditedDatetimeStamp: Joi.number().max(999999999999999).required(),
          acceptedByUserId: Joi.number().max(999999999999999).allow(null).required(),
          amount: Joi.number().max(999999999999999).required(),
          action: Joi.string().valid('payment', 'withdrawl').required()
        })
      )
    });

    this.uniqueKeyDefList = [
      {
        filters: {},
        keyList: ['phone']
      }
    ];

    this.foreignKeyDefList = [
      {
        targetCollection: 'organization',
        foreignKey: 'id',
        referringKey: 'organizationId'
      }
    ];
  }

  create({ organizationId, fullName, phone, openingBalance }, cbfn) {
    let customer = {
      createdDatetimeStamp: (new Date).getTime(),
      lastModifiedDatetimeStamp: (new Date).getTime(),
      fullName,
      organizationId,
      phone,
      balance: openingBalance,
      additionalPaymentHistory: [{
        creditedDatetimeStamp: (new Date).getTime(),
        acceptedByUserId: null,
        amount: openingBalance,
        action: 'payment'
      }],
      isDeleted: false
    }
    this._insert(customer, (err, id) => {
      return cbfn(err, id);
    })
  }

  update({ customerId }, { fullName, phone }, cbfn) {
    let modifications = {
      $set: { fullName, phone }
    }
    this._update({ id: customerId }, modifications, cbfn);
  }

  updateBalance({ customerId }, { balance, additionalPaymentHistory }, cbfn) {
    let modifications = {
      $set: { balance, additionalPaymentHistory }
    }
    this._update({ id: customerId }, modifications, cbfn);
  }

  updateBalanceOnly({ customerId }, { balance }, cbfn) {
    let modifications = {
      $set: { balance }
    }
    this._update({ id: customerId }, modifications, cbfn);
  }

  delete({ customerId }, cbfn) {
    let modifications = {
      $set: { isDeleted: true }
    }
    this._update({ id: customerId }, modifications, cbfn);
  }

  listByOrganizationId({ organizationId }, cbfn) {
    this._find({ organizationId, isDeleted: false }, cbfn);
  }

  findById({ customerId }, cbfn) {
    this._findOne({ id: customerId, isDeleted: false }, cbfn);
  }

}
