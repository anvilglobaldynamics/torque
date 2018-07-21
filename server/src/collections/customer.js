
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.CustomerCollection = class extends Collection {

  get name() { return 'customer'; }

  get joiSchema() {
    return Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      fullName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required(),
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
  }

  get uniqueKeyDefList() {
    return [
      {
        filters: {},
        keyList: []
      }
    ];
  }

  get foreignKeyDefList() {
    return [
      {
        targetCollection: 'organization',
        foreignKey: 'id',
        referringKey: 'organizationId'
      }
    ];
  }

  get deletionIndicatorKey() { return 'isDeleted'; }

  async create({ organizationId, fullName, phone, openingBalance, acceptedByUserId }) {
    return await this._insert({
      createdDatetimeStamp: (new Date).getTime(),
      lastModifiedDatetimeStamp: (new Date).getTime(),
      fullName,
      organizationId,
      phone,
      balance: openingBalance,
      additionalPaymentHistory: [{
        creditedDatetimeStamp: (new Date).getTime(),
        acceptedByUserId,
        amount: openingBalance,
        action: 'payment'
      }],
      isDeleted: false
    });
  }

  async setProfile({ id }, { fullName, phone }) {
    return await this._update({ id }, {
      $set: {
        fullName, phone
      }
    });
  }

  async setAdditionalPaymentHistory({ id }, { additionalPaymentHistory }) {
    return await this._update({ id }, {
      $set: {
        additionalPaymentHistory
      }
    });
  }

  async setBalance({ id }, { balance }) {
    return await this._update({ id }, {
      $set: {
        balance
      }
    });
  }

  async listByOrganizationId({ organizationId }) {
    return await this._find({ organizationId });
  }

  async listByOrganizationIdAndSearchString({ organizationId }) {
    let query = { organizationId };
    if (searchString) {
      let searchRegex = new RegExp(searchString, 'i');
      query.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { nid: searchRegex }
      ];
    }
    return await this._find(query);
  }

}
