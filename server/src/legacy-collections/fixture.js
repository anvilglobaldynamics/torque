
const { LegacyCollection } = require('./../legacy-collection-base');
const Joi = require('joi');

exports.FixtureCollection = class extends LegacyCollection {

  constructor(...args) {
    super(...args);

    this.collectionName = 'fixture';

    this.joiSchema = Joi.object().keys({});

    this.uniqueKeyDefList = [
      {
        filters: {},
        keyList: ['name']
      }
    ];

    this.foreignKeyDefList = [];
  }

  _findByName(name, cbfn) {
    this._findOne({ name }, cbfn);
  }

  getDesignationList(cbfn) {
    return this._findByName('designation-list', (err, doc) => {
      if (err) return cbfn(err);
      return cbfn(null, doc.data);
    });
  }

  getRoleList(cbfn) {
    return this._findByName('role-list', (err, doc) => {
      if (err) return cbfn(err);
      return cbfn(null, doc.data);
    });
  }

  getPrivilegeList(cbfn) {
    return this._findByName('privilege-list', (err, doc) => {
      if (err) return cbfn(err);
      return cbfn(null, doc.data);
    });
  }

}
