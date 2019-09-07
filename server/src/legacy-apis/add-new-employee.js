let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

const { getPrivilegesSchemaFromJson } = require('../utils/privilege-loader');

let { userCommonMixin } = require('./mixins/user-common');
let { phoneVerificationRequestMixin } = require('./mixins/phone-verification-request-mixin');

exports.AddNewEmployeeApi = class extends phoneVerificationRequestMixin(userCommonMixin(LegacyApi)) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      fullName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required(),
      password: Joi.string().min(8).max(30).required(),

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
    let { fullName, phone, password, organizationId, role, designation, companyProvidedId, privileges } = body;
    let { aPackage } = this.interimData;
    this._checkOrganizationPackageEmployeeLimit({ organizationId, aPackage }, () => {
      this._createUser({ fullName, phone, password, agreedToTocDatetimeStamp: null }, (userId) => {
        this._hireUser({ userId, organizationId, role, designation, companyProvidedId, privileges }, (employmentId) => {
          this._createPhoneVerificationRequest({ phone, userId }, (verificationLink) => {
            this._sendPhoneVerificationSms({ phone, verificationLink });
            this.success({ status: "success", userId, employmentId });
          });
        });
      });
    });
  }

}