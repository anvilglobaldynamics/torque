
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.ProductCategoryCollection = class extends Collection {

  get name() { return 'product-category'; }

  get joiSchema() {
    return Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

      name: Joi.string().min(1).max(64).required(),
      colorCode: Joi.string().length(6).required(),
      organizationId: Joi.number().max(999999999999999).required(),

      isDeleted: Joi.boolean().required()
    });
  }

  get uniqueKeyDefList() {
    return [
      {
        filters: {},
        keyList: ['organizationId+name']
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

  async create({ name, organizationId, colorCode }) {
    return await this._insert({
      name, organizationId, colorCode,
      isDeleted: false
    });
  }

  async setDetails({ id }, { name, colorCode }) {
    return await this._update({ id }, {
      $set: {
        name, colorCode
      }
    });
  }

  async listByOrganizationId({ organizationId }) {
    return await this._find({ organizationId });
  }

  async findByIdAndOrganizationId({ id, organizationId }) {
    return await this._findOne({ id, organizationId });
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


  async listByOrganizationIdAndIdList({ organizationId, idList }) {
    let query = { organizationId, id: { $in: idList } };
    return await this._find(query);
  }

}
