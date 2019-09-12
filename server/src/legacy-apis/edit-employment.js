let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

const { getPrivilegesSchemaFromJson } = require('../utils/privilege-loader');

let { collectionCommonMixin } = require('./mixins/collection-common');
let { userCommonMixin } = require('./mixins/user-common');

exports.EditEmploymentApi = class extends userCommonMixin(collectionCommonMixin(LegacyApi)) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),
      employmentId: Joi.number().max(999999999999999).required(),

      isActive: Joi.boolean().required(),

      role: Joi.string().max(64).required(),
      designation: Joi.string().max(64).required(),
      companyProvidedId: Joi.string().allow('').max(64).required(),

      privileges: getPrivilegesSchemaFromJson()
    });
  }

  get accessControl() {
    return [{
      organizationBy: {
        from: "employment",
        query: ({ employmentId }) => ({ id: employmentId }),
        select: "organizationId",
        errorCode: "EMPLOYEE_INVALID"
      },
      privilegeList: [
        "PRIV_MODIFY_USERS"
      ]
    }];
  }

  _updateEmployment({ employmentId, isActive, role, designation, companyProvidedId, privileges }, cbfn) {
    this.legacyDatabase.employment.update({ employmentId }, { isActive, role, designation, companyProvidedId, privileges }, (err, wasUpdated) => {
      if (!this._ensureUpdate(err, wasUpdated, "outlet")) return;
      this.legacyDatabase.employment.getEmploymentById({ employmentId }, (err, employment) => {
        this._expireUserSessionRemotely({ userId: employment.userId }, () => {
          return cbfn();
        });
      });
    });
  }

  handle({ body }) {
    let { employmentId, isActive, role, designation, companyProvidedId, privileges } = body;
    this._updateEmployment({ employmentId, isActive, role, designation, companyProvidedId, privileges }, _ => {
      this.success({ status: "success" });
    });
  }

}