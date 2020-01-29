
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.VendorCollection = class extends Collection {

  get name() { return 'vendor'; }

  get joiSchema() {
    return Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

      name: Joi.string().min(1).max(64).required(),
      contactPersonName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).required(),
      physicalAddress: Joi.string().min(1).max(128).required(),

      organizationId: Joi.number().max(999999999999999).required(),
      isDeleted: Joi.boolean().required()
    });
  }

  get uniqueKeyDefList() {
    return [
      {
        filters: {},
        keyList: ['organizationId+name', 'organizationId+phone']
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

  async create({ name, contactPersonName, phone, physicalAddress, organizationId }) {
    return await this._insert({
      name, contactPersonName, phone, physicalAddress, organizationId,
      isDeleted: false
    });
  }

  async setDetails({ id }, { name, contactPersonName, phone, physicalAddress }) {
    return await this._update({ id }, {
      $set: {
        name, contactPersonName, phone, physicalAddress
      }
    });
  }

  async listByOrganizationId({ organizationId }) {
    return await this._find({ organizationId });
  }

  async listByOrganizationIdAndSearchString({ organizationId, searchString }) {
    let query = { organizationId };
    if (searchString) {
      let escapedSearchString = this.escapeRegExp(searchString.toLowerCase());
      let searchRegex = new RegExp(escapedSearchString, 'i');
      query.$or = [
        { name: searchRegex }
      ];
    }
    return await this._find(query);
  }

  async findByIdAndOrganizationId({ id, organizationId }) {
    return await this._findOne({ id, organizationId });
  }

  async listByOrganizationIdAndIdList({ organizationId, idList }) {
    let query = { organizationId, id: { $in: idList } };
    return await this._find(query);
  }

}
