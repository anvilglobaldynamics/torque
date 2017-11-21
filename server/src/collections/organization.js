
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.OrganizationCollection = class extends Collection {

  constructor(...args) {
    super(...args);

    this.collectionName = 'organization';

    this.joiSchema = Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      name: Joi.string().min(1).max(64).required(),
      primaryBusinessAddress: Joi.string().min(1).max(128).required(),
      phone: Joi.string().alphanum().min(11).max(14).required(),
      email: Joi.string().email().min(3).max(30).required(),
      licenceExpiresOnDatetimeStamp: Joi.number().max(999999999999999).required(),
      isDeleted: Joi.boolean().required()
    });

    this.uniqueDefList = [
      {
        additionalQueryFilters: {},
        uniqueKeyList: ['email', 'phone']
      }
    ]
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

  listByIdList(idList, cbfn) {
    this._find({ id: { $in: idList } }, cbfn);
  }

}
