const { LegacyCollection } = require('./../legacy-collection-base');
const Joi = require('joi');

exports.OrganizationCollection = class extends LegacyCollection {

  constructor(...args) {
    super(...args);

    this.collectionName = 'organization';

    this.joiSchema = Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      name: Joi.string().min(1).max(64).required(),
      primaryBusinessAddress: Joi.string().min(1).max(128).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required(),
      email: Joi.string().email().min(3).max(30).allow('').required(),
      licenceExpiresOnDatetimeStamp: Joi.number().max(999999999999999).required(),
      isDeleted: Joi.boolean().required()
    });

    this.uniqueKeyDefList = [
      {
        filters: {},
        keyList: []
      }
    ];
  }

  create({ name, primaryBusinessAddress, phone, email, licenceExpiresOnDatetimeStamp }, cbfn) {
    let user = {
      createdDatetimeStamp: (new Date).getTime(),
      lastModifiedDatetimeStamp: (new Date).getTime(),
      name,
      primaryBusinessAddress,
      phone,
      email,
      licenceExpiresOnDatetimeStamp,
      isDeleted: false
    }
    this._insert(user, (err, id) => {
      return cbfn(err, id);
    });
  }

  update({ organizationId }, { name, primaryBusinessAddress, phone, email }, cbfn) {
    let modifications = {
      $set: {
        name, primaryBusinessAddress, phone, email
      }
    }
    this._update({ id: organizationId }, modifications, cbfn);
  }

  listByIdList({ idList }, cbfn) {
    this._find({ id: { $in: idList } }, cbfn);
  }

  findById({ organizationId }, cbfn) {
    this._findOne({ id: organizationId, isDeleted: false }, cbfn);
  }

}
