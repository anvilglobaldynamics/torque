
const { LegacyCollection } = require('./../legacy-collection-base');

/* =================================================================
+++++++++++++                   WARNING                +++++++++++++
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
++ This is a LegacyCollection. It uses async callbacks. New APIs  ++
++ should not be using this. Even when using with legacy APIs, if ++
++ you make a change, pleaase replicate the change in the         ++
++ non-legacy Collection of the same name.                        ++
++ Talk to @iShafayet if unsure.                                  ++
================================================================= */

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
