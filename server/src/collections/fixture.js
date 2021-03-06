
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.FixtureCollection = class extends Collection {

  get name() { return 'fixture'; }

  get joiSchema() {
    return Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      name: Joi.string(),
      version: Joi.number(),
      data: Joi.any()
    });
  }

  get uniqueKeyDefList() {
    return [
      {
        filters: {},
        keyList: ['name']
      }
    ];
  }

  get foreignKeyDefList() {
    return [];
  }

  async getDesignationList() {
    return (await this._findOne({ name: 'designation-list' })).data;
  }

  async getRoleList() {
    return (await this._findOne({ name: 'role-list' })).data;
  }

  async getPrivilegeList() {
    return (await this._findOne({ name: 'privilege-list' })).data;
  }

  async getPackageList() {
    return (await this._findOne({ name: 'package-list' })).data;
  }

  async getOutletCategoryList() {
    return (await this._findOne({ name: 'outlet-category-list' })).data;
  }

  async findPackageByCode({ packageCode }) {
    return (await this.getPackageList()).find(aPackage => aPackage.code === packageCode);
  }

  async findOutletCategoryByCode({ categoryCode }) {
    return (await this.getOutletCategoryList()).find(aPackage => aPackage.code === categoryCode);
  }

  async getModuleList() {
    return (await this._findOne({ name: 'module-list' })).data;
  }

  async findModuleByCode({ moduleCode }) {
    return (await this.getModuleList()).find(aModule => aModule.code === moduleCode);
  }

}
