
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.WarehouseCollection = class extends Collection {

  get name() { return 'warehouse'; }

  get joiSchema() {
    return Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      name: Joi.string().min(1).max(64).required(),
      organizationId: Joi.number().max(999999999999999).required(),
      physicalAddress: Joi.string().min(1).max(128).required(),
      contactPersonName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).required(),
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

  async create({ name, organizationId, physicalAddress, phone, contactPersonName }) {
    return await this._insert({
      name,
      organizationId,
      physicalAddress,
      phone,
      contactPersonName,
      isDeleted: false
    });
  }

  async setDetails({ id }, { name, physicalAddress, phone, contactPersonName }) {
    return await this._update({ id }, {
      $set: {
        name, physicalAddress, phone, contactPersonName
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

}
