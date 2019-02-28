
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.OutletCollection = class extends Collection {

  get name() { return 'outlet'; }

  get joiSchema() {
    return Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      name: Joi.string().min(1).max(64).required(),
      organizationId: Joi.number().max(999999999999999).required(),
      physicalAddress: Joi.string().min(1).max(128).required(),
      contactPersonName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required(),
      location: Joi.object().keys({
        lat: Joi.number().required(),
        lng: Joi.number().required()
      }).required(),
      categoryCode: Joi.string().required(),
      isDeleted: Joi.boolean().required()
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

  async create({ name, organizationId, physicalAddress, phone, contactPersonName, location, categoryCode }) {
    return await this._insert({
      createdDatetimeStamp: (new Date).getTime(),
      lastModifiedDatetimeStamp: (new Date).getTime(),
      name,
      organizationId,
      physicalAddress,
      phone,
      contactPersonName,
      location,
      categoryCode,
      isDeleted: false
    });
  }

  async setDetails({ id }, { name, physicalAddress, phone, contactPersonName, location, categoryCode }) {
    return await this._update({ id }, {
      $set: {
        name, physicalAddress, phone, contactPersonName, location, categoryCode
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
