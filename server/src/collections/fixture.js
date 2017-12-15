
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.FixtureCollection = class extends Collection {

  constructor(...args) {
    super(...args);

    this.collectionName = 'customer';

    this.joiSchema = Joi.object().keys({});

    this.uniqueKeyDefList = [
      {
        filters: {},
        keyList: ['name']
      }
    ];

    this.foreignKeyDefList = [];
  }

  _findByName( name , cbfn) {
    this._findOne({ name }, cbfn);
  }

  getDesignationList(cbfn) {
    return this._findByName('designation-list', cbfn);
  }

  getRoleList(cbfn) {
    return this._findByName('role-list', cbfn);
  }

  getPrivilegeList(cbfn) {
    return this._findByName('privilege-list', cbfn);
  }

}
