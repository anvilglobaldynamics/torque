
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

exports.CustomerCollection = class extends LegacyCollection {

  constructor(...args) {
    super(...args);

    this.collectionName = 'customer';

    this.joiSchema = Joi.object().keys({

      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      isDeleted: Joi.boolean().required(),

      fullName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required(),
      organizationId: Joi.number().max(999999999999999).required(),
      changeWalletBalance: Joi.number().max(999999999999999).required(),

      withdrawalHistory: Joi.array().items(
        Joi.object().keys({
          creditedDatetimeStamp: Joi.number().max(999999999999999).required(),
          byUserId: Joi.number().max(999999999999999).required(),
          amount: Joi.number().max(999999999999999).required()
        })
      )

    });

    this.uniqueKeyDefList = [
      {
        filters: {},
        keyList: ['organizationId+phone']
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

  create({ organizationId, fullName, phone }, cbfn) {
    let customer = {
      createdDatetimeStamp: (new Date).getTime(),
      lastModifiedDatetimeStamp: (new Date).getTime(),
      fullName,
      organizationId,
      phone,
      changeWalletBalance: 0,
      withdrawalHistory: [],
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

  listByOrganizationIdAndSearchString({ organizationId, searchString }, cbfn) {
    let query = { organizationId, isDeleted: false };
    if (searchString) {
      searchString = this.escapeRegExp(searchString.toLowerCase());
      let searchRegex = new RegExp(searchString, 'i');
      query.$or = [
        { fullName: searchRegex },
        { phone: searchRegex }
      ];
    }
    this._find(query, cbfn);
  }

  findById({ customerId }, cbfn) {
    this._findOne({ id: customerId, isDeleted: false }, cbfn);
  }

}
