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

exports.OutletCollection = class extends LegacyCollection {

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
      phone: Joi.string().min(1).max(64).required(), // is actually an arbitrary string, not just a phone number
      location: Joi.object().keys({
        lat: Joi.number().required(),
        lng: Joi.number().required()
      }).required(),
      isDeleted: Joi.boolean().required(),
      originApp: Joi.string().valid('torque', 'torque-lite').required(),
      outletReceiptText: Joi.string().min(0).max(64).allow('').required(),
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

  create({ originApp, name, organizationId, physicalAddress, phone, contactPersonName, location, outletReceiptText }, cbfn) {
    let doc = {
      originApp,
      name,
      organizationId,
      physicalAddress,
      phone,
      contactPersonName,
      location,
      outletReceiptText,
      isDeleted: false
    }
    this._insert(doc, (err, id) => {
      return cbfn(err, id);
    });
  }

  update({ outletId }, { name, physicalAddress, phone, contactPersonName, location, outletReceiptText }, cbfn) {
    let modifications = {
      $set: {
        name, physicalAddress, phone, contactPersonName, location, outletReceiptText
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
      searchString = this.escapeRegExp(searchString.toLowerCase());
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