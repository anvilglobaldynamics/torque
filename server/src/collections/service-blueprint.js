
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.ServiceBlueprintCollection = class extends Collection {

  get name() { return 'service-blueprint'; }

  get joiSchema() {
    return Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

      organizationId: Joi.number().max(999999999999999).required(),
      name: Joi.string().min(1).max(64).required(),

      defaultVat: Joi.number().min(0).max(999999999999999).required(),
      defaultSalePrice: Joi.number().min(0).max(999999999999999).required(),

      isLongstanding: Joi.boolean().required(),
      serviceDuration: Joi.object().allow(null).required().keys({
        months: Joi.number().min(0).max(999999999999999).required(),
        days: Joi.number().min(0).max(999999999999999).required(),
      }),

      isEmployeeAssignable: Joi.boolean().required(),
      isCustomerRequired: Joi.boolean().required(),
      isRefundable: Joi.boolean().required(),
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

  async create({
    organizationId,
    name,
    defaultVat,
    defaultSalePrice,
    isLongstanding,
    serviceDuration,
    isEmployeeAssignable,
    isCustomerRequired,
    isRefundable
  }) {
    return await this._insert({
      organizationId,
      name,
      defaultVat,
      defaultSalePrice,
      isLongstanding,
      serviceDuration,
      isEmployeeAssignable,
      isCustomerRequired,
      isRefundable,
      isDeleted: false
    });
  }

  async setDetails({ id }, { name, defaultVat, defaultSalePrice, isLongstanding, serviceDuration, isEmployeeAssignable, isCustomerRequired, isRefundable }) {
    return await this._update({ id }, {
      $set: {
        name, defaultVat, defaultSalePrice, isLongstanding, serviceDuration, isEmployeeAssignable, isCustomerRequired, isRefundable
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

  async listByOrganizationIdAndIdList({ organizationId, idList }) {
    let query = { organizationId, id: { $in: idList } };
    return await this._find(query);
  }

}
