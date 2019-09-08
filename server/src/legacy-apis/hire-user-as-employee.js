let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

const { getPrivilegesSchemaFromJson } = require('../utils/privilege-loader');

let { collectionCommonMixin } = require('./mixins/collection-common');
let { userCommonMixin } = require('./mixins/user-common');

exports.HireUserAsEmployeeApi = class extends userCommonMixin(collectionCommonMixin(LegacyApi)) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      userId: Joi.number().max(999999999999999).required(),

      organizationId: Joi.number().max(999999999999999).required(),
      role: Joi.string().max(64).required(),
      designation: Joi.string().max(64).required(),
      companyProvidedId: Joi.string().allow('').max(64).required(),

      privileges: getPrivilegesSchemaFromJson()
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privilegeList: [
        "PRIV_MODIFY_USERS"
      ]
    }];
  }

  _checkIfUserEmployed({ userId, organizationId }, cbfn) {
    this.legacyDatabase.employment.getActiveEmploymentsOfUser({ userId }, (err, employmentList) => {
      if (err) return this.fail(err);
      employmentList = employmentList.filter(employment => employment.organizationId === organizationId);
      if (employmentList.length > 0) {
        err = new Error("User is already employed");
        err.code = "ALREADY_EMPLOYED"
        return this.fail(err);
      }
      return cbfn();
    })
  }

  _hireUser({ userId, organizationId, role, designation, companyProvidedId, privileges }, cbfn) {
    this.legacyDatabase.employment.hireExistingUser({ userId, organizationId, role, designation, companyProvidedId, privileges }, (err, employmentId) => {
      return cbfn(employmentId);
    })
  }

  _checkOrganizationPackageEmployeeLimit({ organizationId, aPackage }, cbfn) {
    this.legacyDatabase.employment.listByOrganizationId({ organizationId }, (err, employmentList) => {
      if (err) return this.fail(err);
      if (employmentList.length == aPackage.limits.maximumEmployees) {
        err = new Error(this.verses.packageLimitCommon.activePackageLimitReached);
        err.code = "ORGANIZATION_PACKAGE_LIMIT_REACHED";
        return this.fail(err);
      }
      return cbfn();
    });
  }

  handle({ body }) {
    let { userId, organizationId, role, designation, companyProvidedId, privileges } = body;
    let { aPackage } = this.interimData;
    this._checkOrganizationPackageEmployeeLimit({ organizationId, aPackage }, () => {
      this._findUserById({ userId }, (user) => {
        this._checkIfUserEmployed({ userId, organizationId }, () => {
          this._hireUser({ userId, organizationId, role, designation, companyProvidedId, privileges }, (employmentId) => {
            this.success({ status: "success", employmentId });
          });
        });
      });
    });
  }

}