
const Joi = require('joi');

let { ensureKeysAreUnique } = require('./../utils/ensure-unique');

exports.organizationMixin = (DatabaseClass) => class extends DatabaseClass {

  get organizationSchema() {
    return Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      name: Joi.string().min(1).max(64).required(),
      primaryBusinessAddress: Joi.string().min(1).max(128).required(),
      phone: Joi.string().alphanum().min(11).max(14).required(),
      email: Joi.string().email().min(3).max(30).required(),
      licenceExpiresOnDatetimeStamp: Joi.number().max(999999999999999).required(),
      isDeleted: Joi.boolean().required()
    });
  }

  _validateOrganization(doc, cbfn) {
    let { error: err } = Joi.validate(doc, this.organizationSchema, {
      convert: false
    });
    if (err) return cbfn(err);
    let uniqueKeyList = ['email', 'phone']
    ensureKeysAreUnique(this, 'organization', {}, doc, uniqueKeyList, (err) => {
      if (err) return cbfn(err);
      cbfn();
    });
  }

  _insertOrganization(doc, cbfn) {
    this._validateOrganization(doc, (err) => {
      if (err) return cbfn(err);
      this.autoGenerateKey('organization', (err, organizationId) => {
        if (err) return cbfn(err);
        doc.id = organizationId;
        this.insertOne('organization', doc, (err, count) => {
          if (err) return cbfn(err);
          if (count !== 1) return cbfn(new Error("Could not insert organization for reasons unknown."));
          return cbfn(null, organizationId);
        });
      });
    });
  }

  _updateOrganization(query, modifications, cbfn) {
    this.update('organization', query, modifications, cbfn);
  }

  // public:

  createOrganization({ name, primaryBusinessAddress, phone, email, licenceExpiresOnDatetimeStamp }, cbfn) {
    let organization = {
      createdDatetimeStamp: (new Date).getTime(),
      lastModifiedDatetimeStamp: (new Date).getTime(),
      name, 
      primaryBusinessAddress, 
      phone, 
      email,
      licenceExpiresOnDatetimeStamp,
      isDeleted: false
    }
    this._insertOrganization(organization, (err, id) => {
      return cbfn(err, id);
    })
  }

}
