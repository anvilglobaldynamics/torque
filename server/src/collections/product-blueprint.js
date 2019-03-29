
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.ProductBlueprintCollection = class extends Collection {

  get name() { return 'product-blueprint'; }

  get joiSchema() {
    return Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      name: Joi.string().min(1).max(64).required(),
      organizationId: Joi.number().max(999999999999999).required(),
      unit: Joi.string().max(64).required(),
      identifierCode: Joi.string().max(64).allow('').required(),
      defaultPurchasePrice: Joi.number().max(999999999999999).required(),
      defaultVat: Joi.number().max(999999999999999).required(),
      defaultSalePrice: Joi.number().max(999999999999999).required(),
      isDeleted: Joi.boolean().required(),
      isReturnable: Joi.boolean().required()
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

  async create({ organizationId,
    name,
    unit,
    identifierCode,
    defaultPurchasePrice,
    defaultVat,
    defaultSalePrice,
    isReturnable }) {
    return await this._insert({
      createdDatetimeStamp: (new Date).getTime(),
      lastModifiedDatetimeStamp: (new Date).getTime(),
      organizationId,
      name,
      unit,
      identifierCode,
      defaultPurchasePrice,
      defaultVat,
      defaultSalePrice,
      isReturnable,
      isDeleted: false
    });
  }

  async setDetails({ id }, { name, unit, identifierCode, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable }) {
    return await this._update({ id }, {
      $set: {
        name, unit, identifierCode, defaultPurchasePrice, defaultVat, defaultSalePrice, isReturnable
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
        { name: searchRegex }
      ];
    }
    return await this._find(query);
  }

  async listByOrganizationIdListAndSearchString({ organizationIdList, searchString }) {
    let query = {
      organizationId: { $in: organizationIdList }
    };
    searchString = this.escapeRegExp(searchString.toLowerCase());
    let searchRegex = new RegExp(searchString, 'i');
    query.name = searchRegex;
    return await this._find(query);
  }

}
