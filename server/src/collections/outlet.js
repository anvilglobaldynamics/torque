const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.OutletCollection = class extends Collection {

  constructor(...args) {
    super(...args);

    this.collectionName = 'outlet';

    this.joiSchema = Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      name: Joi.string().min(1).max(64).required(),
      organizationId: Joi.number().max(999999999999999).required(),
      physicalAddress: Joi.string().min(1).max(128).required(),
      contactPersonName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().alphanum().min(11).max(14).required(),
      isDeleted: Joi.boolean().required()
    });

    this.uniqueKeyDefList = [
      {
        filters: {},
        keyList: []
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

  create({ name, organizationId, physicalAddress, phone, contactPersonName }, cbfn) {
    let doc = {
      createdDatetimeStamp: (new Date).getTime(),
      lastModifiedDatetimeStamp: (new Date).getTime(),
      name,
      organizationId,
      physicalAddress,
      phone,
      contactPersonName,
      isDeleted: false
    }
    this._insert(doc, (err, id) => {
      return cbfn(err, id);
    });
  }

  update({ outletId }, { name, physicalAddress, phone, contactPersonName }, cbfn) {
    let modifications = {
      $set: {
        name, physicalAddress, phone, contactPersonName
      }
    }
    this._update({ id: outletId }, modifications, cbfn);
  }

  delete({ outletId }, cbfn) {
    let modifications = {
      $set: { isDeleted: true }
    }
    this._update({ id: outletId }, modifications, cbfn);
  }

  listByOrganizationId({ organizationId }, cbfn) {
    this._find({ organizationId }, cbfn);
  }

  listByOrganizationIdAndSearchString({ organizationId, searchString }, cbfn) {
    let query = { organizationId, isDeleted: false };
    if (searchString) {
      let searchRegex = new RegExp(searchString, 'i');
      query.$or = [
        { name: searchRegex },
        { physicalAddress: searchRegex },
        { contactPersonName: searchRegex },
        { phone: searchRegex }
      ];
      if (String(parseInt(searchString)) === searchString) {
        query.$or.push({ id: parseInt(searchString) });
      }
    }
    this._find(query, cbfn);
  }

  findById({ outletId }, cbfn) {
    this._findOne({ id: outletId }, cbfn)
  }

}