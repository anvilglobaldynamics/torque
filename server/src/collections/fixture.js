
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.FixtureCollection = class extends Collection {

  get name() { return 'fixture'; }

  get joiSchema() {
    return Joi.object().keys({});
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
    return await this._findOne({ name: 'designation-list' });
  }

  async getRoleList() {
    return await this._findOne({ name: 'role-list' });
  }
  
  async getPrivilegeList() {
    return await this._findOne({ name: 'privilege-list' });
  }

}
