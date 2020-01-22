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

exports.OrganizationCollection = class extends LegacyCollection {

  constructor(...args) {
    super(...args);

    this.collectionName = 'organization';

    this.joiSchema = Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      createdByUserId: Joi.number().max(999999999999999).required(),
      name: Joi.string().min(1).max(64).required(),
      primaryBusinessAddress: Joi.string().min(1).max(128).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).required(),
      countryCode: Joi.string().regex(/^[a-z0-9\+]*$/i).min(2).max(4).required(),
      email: Joi.string().email().min(3).max(30).allow('').required(),
      packageActivationId: Joi.number().max(999999999999999).allow(null).required(),
      isDeleted: Joi.boolean().required(),
      activeModuleCodeList: Joi.array().items(
        Joi.string()
      ).required(),
      originApp: Joi.string().valid('torque', 'torque-lite').required(),
    });

    this.uniqueKeyDefList = [
      {
        filters: {},
        keyList: []
      }
    ];
  }

  /*
  WARNING! This method has no usage and has been deprecated. Use the Non-legacy verion.
  */
  __depr__create({ name, primaryBusinessAddress, phone, email }, cbfn) {
    let user = {
      name,
      primaryBusinessAddress,
      phone,
      email,
      packageActivationId: null,
      isDeleted: false,
      activeModuleCodeList: []
    }
    this._insert(user, (err, id) => {
      return cbfn(err, id);
    });
  }

  update({ organizationId }, { name, primaryBusinessAddress, phone, email }, cbfn) {
    let modifications = {
      $set: {
        name, primaryBusinessAddress, phone, email
      }
    }
    this._update({ id: organizationId }, modifications, cbfn);
  }

  listByIdList({ idList }, cbfn) {
    this._find({ id: { $in: idList } }, cbfn);
  }

  findById({ organizationId }, cbfn) {
    this._findOne({ id: organizationId, isDeleted: false }, cbfn);
  }

}
