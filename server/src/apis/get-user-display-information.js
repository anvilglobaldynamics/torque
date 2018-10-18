
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { UserMixin } = require('./mixins/user-mixin');

exports.GetUserDisplayInformationApi = class extends Api.mixin(UserMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required(),
      userId: Joi.number().max(999999999999999).required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privilegeList: [
        "PRIV_VIEW_USERS"
      ]
    }];
  }

  async handle({ body, userId: apiCallerUserId }) {
    let { organizationId, userId } = body;

    let { user } = await this.__getUser({ userId });

    let employmentList = await this.database.employment.listEmploymentOfUserInOrganization({ userId, organizationId });
    if (employmentList.length === 0) {
      throw new CodedError("EMPLOYEE_INVALID", "The use is not employed by this organization");
    }
    let employment = employmentList[0];

    let { fullName, phone, email } = extract(user, [
      'fullName',
      'email',
      'phone',
    ]);

    let { designation, role, companyProvidedId, isActive } = extract(employment, [
      'designation',
      'role',
      'companyProvidedId',
      'isActive'
    ]);

    return {
      userDisplayInformation: {
        fullName, phone, email,
        designation, role, companyProvidedId, isActive
      }
    };
  }

}