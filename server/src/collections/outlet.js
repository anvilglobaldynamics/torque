
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.OutletCollection = class extends Collection {

  get name() { return 'outlet'; }

  get joiSchema() {
    // NOTE: Make sure to check with receipt.js's receiptData property before making any
    // changes to this schema
    return Joi.object().keys({
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
      }).allow(null).required(),
      categoryCode: Joi.string().required(),
      isDeleted: Joi.boolean().required(),
      originApp: Joi.string().valid('torque', 'torque-lite').required(),
      outletReceiptText: Joi.string().min(0).max(64).allow('').required(),
    });
  }

  get uniqueKeyDefList() {
    return [];
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

  async create({ originApp, name, organizationId, physicalAddress, phone, contactPersonName, location, categoryCode, outletReceiptText }) {
    return await this._insert({
      originApp,
      name,
      organizationId,
      physicalAddress,
      phone,
      contactPersonName,
      location,
      categoryCode,
      outletReceiptText,
      isDeleted: false
    });
  }

  async setDetails({ id }, { name, physicalAddress, phone, contactPersonName, location, categoryCode, outletReceiptText }) {
    return await this._update({ id }, {
      $set: {
        name, physicalAddress, phone, contactPersonName, location, categoryCode, outletReceiptText
      }
    });
  }

  async listByOrganizationId({ organizationId }) {
    return await this._find({ organizationId });
  }

  async listByOrganizationIdAndSearchString({ organizationId, searchString }) {
    let query = { organizationId };
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
    return await this._find(query);
  }


  async listByIdListAndCategoryCode({ idList, categoryCode }) {
    return await this._find({
      id: { $in: idList },
      categoryCode
    });
  }

}
