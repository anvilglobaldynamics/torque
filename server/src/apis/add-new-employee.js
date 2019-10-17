const { Api } = require('../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../utils/coded-error');
const { extract } = require('../utils/extract');

const { SecurityMixin } = require('./mixins/security-mixin');
const { UserMixin } = require('./mixins/user-mixin');
const { getPrivilegesSchemaFromJson } = require('../utils/privilege-loader');

exports.AddNewEmployeeApi = class extends Api.mixin(UserMixin, SecurityMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
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

  async _checkOrganizationPackageEmployeeLimit({ organizationId, aPackage }) {
    let employmentList = await this.database.employment.listByOrganizationId({ organizationId });
    if (employmentList.length == aPackage.limits.maximumEmployees) {
      throw new CodedError("ORGANIZATION_PACKAGE_LIMIT_REACHED", this.verses.packageLimitCommon.activePackageLimitReached);
    }
  }

  async _hireUser({ userId, organizationId, role, designation, companyProvidedId, privileges }) {
    let employmentId = this.database.employment.addRegularEmployee({ userId, organizationId, role, designation, companyProvidedId, privileges });
    return employmentId;
  }

  async handle({ body, userId: creatorUserId }) {


    let { fullName, phone, password, organizationId, role, designation, companyProvidedId, privileges } = body;
    let { aPackage } = this.interimData;

    let creatorUser = await this.__getUser({ userId: creatorUserId });
    await this._checkOrganizationPackageEmployeeLimit({ organizationId, aPackage });

    let createdUserId = await this._createUser({ fullName, phone, password, agreedToTocDatetimeStamp: null, accessibleApplicationList: ['torque'] });

    let verificationLink = await this._createPhoneVerificationRequest({ phone, userId: createdUserId });
    this._sendPhoneVerificationSms({ phone, verificationLink });


    let employmentId = await this._hireUser({ userId: createdUserId, organizationId, role, designation, companyProvidedId, privileges });

    return { status: "success", userId: createdUserId, employmentId }





  }



}